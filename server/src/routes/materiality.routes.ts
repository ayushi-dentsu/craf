import { Router, type Request, type Response, type NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validateBody, validateQuery } from '../middleware/validation.middleware.js';
import { NotFoundError } from '../middleware/error-handler.middleware.js';
import { calculateMateriality } from '../services/materiality.service.js';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const periodQuerySchema = {
  periodId: { type: 'number' as const, min: 1 },
};

const createBodySchema = {
  periodId: { type: 'number' as const, required: true, min: 1 },
  profitBeforeTax: { type: 'number' as const, required: true },
  totalAssets: { type: 'number' as const, required: true },
  haircutPercent: { type: 'number' as const },
  tolerableError: { type: 'number' as const },
};

// Apply auth to all routes
router.use(authenticate);

// GET /api/materiality — get materiality assessment for a period
router.get(
  '/',
  authorize('materiality', 'read'),
  validateQuery(periodQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let periodId = req.query.periodId ? Number(req.query.periodId) : undefined;

      if (!periodId) {
        const currentPeriod = await prisma.assessmentPeriod.findFirst({
          where: { isCurrent: true },
        });
        if (currentPeriod) periodId = currentPeriod.id;
      }

      if (!periodId) {
        throw new NotFoundError('No assessment period found.');
      }

      const assessment = await prisma.materialityAssessment.findFirst({
        where: { periodId },
      });

      if (!assessment) {
        throw new NotFoundError(`Materiality assessment not found for period ${periodId}.`);
      }

      res.json(assessment);
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/materiality — create/update materiality assessment
router.post(
  '/',
  authorize('materiality', 'write'),
  validateBody(createBodySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { periodId, profitBeforeTax, totalAssets, haircutPercent, tolerableError } = req.body;

      const result = calculateMateriality({
        profitBeforeTax,
        totalAssets,
        haircutPercent,
        tolerableError,
      });

      // Check if an assessment already exists for this period
      const existing = await prisma.materialityAssessment.findFirst({
        where: { periodId },
      });

      let assessment;
      if (existing) {
        assessment = await prisma.materialityAssessment.update({
          where: { id: existing.id },
          data: {
            profitBeforeTax,
            totalAssets,
            revenueMateriality: result.revenueMateriality,
            balanceSheetMateriality: result.balanceSheetMateriality,
            haircutPercent: result.haircutPercent,
            finalRevenueMateriality: result.finalRevenueMateriality,
            finalBSMateriality: result.finalBSMateriality,
            tolerableError: result.tolerableError,
          },
        });
      } else {
        assessment = await prisma.materialityAssessment.create({
          data: {
            periodId,
            profitBeforeTax,
            totalAssets,
            revenueMateriality: result.revenueMateriality,
            balanceSheetMateriality: result.balanceSheetMateriality,
            haircutPercent: result.haircutPercent,
            finalRevenueMateriality: result.finalRevenueMateriality,
            finalBSMateriality: result.finalBSMateriality,
            tolerableError: result.tolerableError,
          },
        });
      }

      res.status(existing ? 200 : 201).json(assessment);
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/materiality/significant-accounts — significant accounts list
router.get(
  '/significant-accounts',
  authorize('materiality', 'read'),
  validateQuery(periodQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let periodId = req.query.periodId ? Number(req.query.periodId) : undefined;

      if (!periodId) {
        const currentPeriod = await prisma.assessmentPeriod.findFirst({
          where: { isCurrent: true },
        });
        if (currentPeriod) periodId = currentPeriod.id;
      }

      if (!periodId) {
        throw new NotFoundError('No assessment period found.');
      }

      const assessment = await prisma.materialityAssessment.findFirst({
        where: { periodId },
      });

      if (!assessment) {
        throw new NotFoundError(`Materiality assessment not found for period ${periodId}.`);
      }

      res.json({
        ...assessment,
        thresholds: {
          revenueThreshold: assessment.finalRevenueMateriality,
          balanceSheetThreshold: assessment.finalBSMateriality,
          tolerableError: assessment.tolerableError,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
