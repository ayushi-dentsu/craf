import { Router, type Request, type Response, type NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validateQuery } from '../middleware/validation.middleware.js';
import { NotFoundError } from '../middleware/error-handler.middleware.js';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const getQuerySchema = {
  auId: { type: 'number' as const, required: true, min: 1 },
  periodId: { type: 'number' as const, min: 1 },
};

const aggregateQuerySchema = {
  auId: { type: 'number' as const, min: 1 },
  themeId: { type: 'number' as const, min: 1 },
  periodId: { type: 'number' as const, min: 1 },
};

// Apply auth + RBAC to all routes
router.use(authenticate);
router.use(authorize('residual-risk', 'read'));

// GET /api/residual-risk — get residual risk for an AU and period
router.get(
  '/',
  validateQuery(getQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auId = Number(req.query.auId);
      let periodId = req.query.periodId ? Number(req.query.periodId) : undefined;

      // Verify AU exists
      const au = await prisma.assessmentUnit.findUnique({
        where: { id: auId },
        select: { id: true },
      });
      if (!au) {
        throw new NotFoundError(`Assessment Unit ${auId} not found.`);
      }

      // Resolve period: use provided periodId or find current period
      if (!periodId) {
        const currentPeriod = await prisma.assessmentPeriod.findFirst({
          where: { isCurrent: true },
        });
        if (currentPeriod) periodId = currentPeriod.id;
      }

      if (!periodId) {
        throw new NotFoundError('No current assessment period found.');
      }

      const residualRisk = await prisma.residualRisk.findUnique({
        where: { auId_periodId: { auId, periodId } },
      });

      if (!residualRisk) {
        throw new NotFoundError(`Residual risk not found for AU ${auId} and period ${periodId}.`);
      }

      res.json({
        auId: residualRisk.auId,
        periodId: residualRisk.periodId,
        inherentRiskScore: residualRisk.inherentRiskScore,
        cerScore: residualRisk.cerScore,
        residualRiskScore: residualRisk.residualRiskScore,
        residualRiskRating: residualRisk.residualRiskRating,
        aggregateResidual: residualRisk.aggregateResidual,
        aggregateRating: residualRisk.aggregateRating,
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/residual-risk/aggregate — aggregate residual risk at AU/theme/enterprise level
router.get(
  '/aggregate',
  validateQuery(aggregateQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auId = req.query.auId ? Number(req.query.auId) : undefined;
      const themeId = req.query.themeId ? Number(req.query.themeId) : undefined;
      let periodId = req.query.periodId ? Number(req.query.periodId) : undefined;

      // Resolve period: use provided periodId or find current period
      if (!periodId) {
        const currentPeriod = await prisma.assessmentPeriod.findFirst({
          where: { isCurrent: true },
        });
        if (currentPeriod) periodId = currentPeriod.id;
      }

      if (!periodId) {
        throw new NotFoundError('No current assessment period found.');
      }

      // Build filter for residual risk records
      const where: Record<string, unknown> = { periodId };

      if (auId) {
        where.auId = auId;
      } else if (themeId) {
        // Filter by theme: find all AUs under this theme
        const aus = await prisma.assessmentUnit.findMany({
          where: { themeId },
          select: { id: true },
        });
        where.auId = { in: aus.map((a) => a.id) };
      }
      // If neither auId nor themeId, return enterprise-level aggregate (all AUs)

      const records = await prisma.residualRisk.findMany({ where: where as any });

      if (records.length === 0) {
        throw new NotFoundError('No residual risk records found for the given filters.');
      }

      // Compute weighted aggregation across all matching records
      let totalWeightedScore = 0;
      let totalCount = 0;

      for (const record of records) {
        if (record.aggregateResidual !== null) {
          totalWeightedScore += record.aggregateResidual;
          totalCount++;
        }
      }

      const aggregateScore = totalCount > 0 ? totalWeightedScore / totalCount : 0;
      const aggregateRating = mapAggregateRating(aggregateScore);

      res.json({
        periodId,
        auId: auId ?? null,
        themeId: themeId ?? null,
        level: auId ? 'au' : themeId ? 'theme' : 'enterprise',
        recordCount: records.length,
        aggregateScore,
        aggregateRating,
        records: records.map((r) => ({
          auId: r.auId,
          residualRiskScore: r.residualRiskScore,
          residualRiskRating: r.residualRiskRating,
          aggregateResidual: r.aggregateResidual,
          aggregateRating: r.aggregateRating,
        })),
      });
    } catch (error) {
      next(error);
    }
  },
);

// Helper: map aggregate residual risk percentage to rating
function mapAggregateRating(score: number): string {
  if (score >= 0.7) return 'Extremely High';
  if (score >= 0.45) return 'High';
  if (score > 0.05) return 'Medium';
  if (score > 0.01) return 'Low';
  return 'Negligible';
}

export default router;
