import { Router, type Request, type Response, type NextFunction } from 'express';
import { PrismaClient, type Prisma } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validateQuery, validateParams } from '../middleware/validation.middleware.js';
import { NotFoundError } from '../middleware/error-handler.middleware.js';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const obligationsQuerySchema = {
  auId: { type: 'number' as const, min: 1 },
  themeId: { type: 'number' as const, min: 1 },
  criticality: { type: 'string' as const, enum: ['Critical', 'High', 'Medium', 'Low'] },
};

const obligationIdParamsSchema = {
  obligationId: { type: 'number' as const, required: true, min: 1 },
};

/**
 * Criticality sort order: Critical > High > Medium > Low.
 * Prisma sorts strings alphabetically by default, so we use a raw SQL
 * ORDER BY with CASE to enforce the correct business ordering.
 * As a simpler approach, we sort in-memory after fetching.
 */
const criticalityOrder: Record<string, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

function sortByCriticality<T extends { criticality: string | null }>(items: T[]): T[] {
  return items.sort((a, b) => {
    const orderA = criticalityOrder[a.criticality ?? ''] ?? 99;
    const orderB = criticalityOrder[b.criticality ?? ''] ?? 99;
    return orderA - orderB;
  });
}

// Apply auth + RBAC to all routes
router.use(authenticate);
router.use(authorize('compliance', 'read'));

// GET /api/compliance/obligations — list obligations with filters
router.get(
  '/obligations',
  validateQuery(obligationsQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { auId, themeId, criticality } = req.query;

      const where: Prisma.ComplianceObligationWhereInput = {};
      if (auId) where.auId = Number(auId);
      if (themeId) where.themeId = Number(themeId);
      if (criticality) where.criticality = String(criticality);

      const obligations = await prisma.complianceObligation.findMany({
        where,
        include: {
          controls: {
            include: {
              qualityAssessments: true,
              performanceAssessments: true,
            },
          },
          theme: { select: { id: true, name: true } },
          au: { select: { id: true, name: true } },
        },
      });

      res.json(sortByCriticality(obligations));
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/compliance/obligations/:obligationId — single obligation detail
router.get(
  '/obligations/:obligationId',
  validateParams(obligationIdParamsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const obligationId = Number(req.params.obligationId);

      const obligation = await prisma.complianceObligation.findUnique({
        where: { id: obligationId },
        include: {
          controls: {
            include: {
              qualityAssessments: true,
              performanceAssessments: true,
            },
          },
          theme: { select: { id: true, name: true } },
          au: { select: { id: true, name: true } },
        },
      });

      if (!obligation) {
        throw new NotFoundError(`Compliance obligation ${obligationId} not found.`);
      }

      res.json(obligation);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
