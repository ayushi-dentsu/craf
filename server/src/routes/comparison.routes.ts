import { Router, type Request, type Response, type NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validateQuery } from '../middleware/validation.middleware.js';
import { NotFoundError } from '../middleware/error-handler.middleware.js';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const yearOverYearQuerySchema = {
  auId: { type: 'number' as const, required: true, min: 1 },
  currentPeriodId: { type: 'number' as const, min: 1 },
  previousPeriodId: { type: 'number' as const, min: 1 },
};

const beforeAfterQuerySchema = {
  auId: { type: 'number' as const, required: true, min: 1 },
  periodId: { type: 'number' as const, required: true, min: 1 },
};

// Apply auth + RBAC to all routes
router.use(authenticate);
router.use(authorize('comparison', 'read'));

/**
 * Compute delta percentage: ((current - previous) / previous) * 100
 * Returns null if previous is 0 or undefined.
 */
function computeDelta(current: number | null | undefined, previous: number | null | undefined): number | null {
  if (previous == null || previous === 0 || current == null) return null;
  return ((current - previous) / previous) * 100;
}

// GET /api/comparison/year-over-year
router.get(
  '/year-over-year',
  validateQuery(yearOverYearQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auId = Number(req.query.auId);
      let currentPeriodId = req.query.currentPeriodId ? Number(req.query.currentPeriodId) : undefined;
      let previousPeriodId = req.query.previousPeriodId ? Number(req.query.previousPeriodId) : undefined;

      // Verify AU exists
      const au = await prisma.assessmentUnit.findUnique({
        where: { id: auId },
        select: { id: true, name: true, code: true },
      });
      if (!au) {
        throw new NotFoundError(`Assessment Unit ${auId} not found.`);
      }

      // Resolve current period
      if (!currentPeriodId) {
        const currentPeriod = await prisma.assessmentPeriod.findFirst({
          where: { isCurrent: true },
        });
        if (!currentPeriod) {
          throw new NotFoundError('No current assessment period found.');
        }
        currentPeriodId = currentPeriod.id;
      }

      // Resolve previous period
      if (!previousPeriodId) {
        const prevPeriod = await prisma.assessmentPeriod.findFirst({
          where: { id: { lt: currentPeriodId } },
          orderBy: { id: 'desc' },
        });
        if (!prevPeriod) {
          throw new NotFoundError('No previous assessment period found.');
        }
        previousPeriodId = prevPeriod.id;
      }

      // Fetch data for both periods
      const [currentIR, previousIR] = await Promise.all([
        prisma.inherentRisk.findUnique({ where: { auId_periodId: { auId, periodId: currentPeriodId } } }),
        prisma.inherentRisk.findUnique({ where: { auId_periodId: { auId, periodId: previousPeriodId } } }),
      ]);

      const [currentCER, previousCER] = await Promise.all([
        prisma.controlEnvironmentRating.findUnique({ where: { auId_periodId: { auId, periodId: currentPeriodId } } }),
        prisma.controlEnvironmentRating.findUnique({ where: { auId_periodId: { auId, periodId: previousPeriodId } } }),
      ]);

      const [currentRR, previousRR] = await Promise.all([
        prisma.residualRisk.findUnique({ where: { auId_periodId: { auId, periodId: currentPeriodId } } }),
        prisma.residualRisk.findUnique({ where: { auId_periodId: { auId, periodId: previousPeriodId } } }),
      ]);

      // Fetch period names
      const [currentPeriod, previousPeriod] = await Promise.all([
        prisma.assessmentPeriod.findUnique({ where: { id: currentPeriodId }, select: { id: true, name: true } }),
        prisma.assessmentPeriod.findUnique({ where: { id: previousPeriodId }, select: { id: true, name: true } }),
      ]);

      res.json({
        auId,
        auName: au.name,
        auCode: au.code,
        currentPeriod: currentPeriod ?? { id: currentPeriodId, name: '' },
        previousPeriod: previousPeriod ?? { id: previousPeriodId, name: '' },
        inherentRisk: {
          current: currentIR ? { score: currentIR.inherentRiskScore, rating: currentIR.inherentRiskRating } : null,
          previous: previousIR ? { score: previousIR.inherentRiskScore, rating: previousIR.inherentRiskRating } : null,
          deltaPercent: computeDelta(currentIR?.inherentRiskScore, previousIR?.inherentRiskScore),
        },
        controlEnvironment: {
          current: currentCER ? { cerScore: currentCER.cerScore, cerRating: currentCER.cerRating, cqiScore: currentCER.cqiScore, cpiScore: currentCER.cpiScore } : null,
          previous: previousCER ? { cerScore: previousCER.cerScore, cerRating: previousCER.cerRating, cqiScore: previousCER.cqiScore, cpiScore: previousCER.cpiScore } : null,
          deltaPercent: computeDelta(currentCER?.cerScore, previousCER?.cerScore),
        },
        residualRisk: {
          current: currentRR ? { score: currentRR.residualRiskScore, rating: currentRR.residualRiskRating, aggregateResidual: currentRR.aggregateResidual, aggregateRating: currentRR.aggregateRating } : null,
          previous: previousRR ? { score: previousRR.residualRiskScore, rating: previousRR.residualRiskRating, aggregateResidual: previousRR.aggregateResidual, aggregateRating: previousRR.aggregateRating } : null,
          deltaPercent: computeDelta(currentRR?.residualRiskScore, previousRR?.residualRiskScore),
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/comparison/before-after
router.get(
  '/before-after',
  validateQuery(beforeAfterQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auId = Number(req.query.auId);
      const periodId = Number(req.query.periodId);

      // Verify AU exists
      const au = await prisma.assessmentUnit.findUnique({
        where: { id: auId },
        select: { id: true, name: true, code: true },
      });
      if (!au) {
        throw new NotFoundError(`Assessment Unit ${auId} not found.`);
      }

      // Find the previous period
      const previousPeriod = await prisma.assessmentPeriod.findFirst({
        where: { id: { lt: periodId } },
        orderBy: { id: 'desc' },
      });

      const previousPeriodId = previousPeriod?.id;

      // Fetch current period data
      const [currentCER, currentRR] = await Promise.all([
        prisma.controlEnvironmentRating.findUnique({ where: { auId_periodId: { auId, periodId } } }),
        prisma.residualRisk.findUnique({ where: { auId_periodId: { auId, periodId } } }),
      ]);

      // Fetch previous period data (before state)
      const [previousCER, previousRR] = previousPeriodId
        ? await Promise.all([
            prisma.controlEnvironmentRating.findUnique({ where: { auId_periodId: { auId, periodId: previousPeriodId } } }),
            prisma.residualRisk.findUnique({ where: { auId_periodId: { auId, periodId: previousPeriodId } } }),
          ])
        : [null, null];

      // Fetch period info
      const currentPeriodInfo = await prisma.assessmentPeriod.findUnique({
        where: { id: periodId },
        select: { id: true, name: true },
      });

      res.json({
        auId,
        auName: au.name,
        auCode: au.code,
        currentPeriod: currentPeriodInfo ?? { id: periodId, name: '' },
        previousPeriod: previousPeriod ? { id: previousPeriod.id, name: previousPeriod.name } : null,
        before: {
          cqiScore: previousCER?.cqiScore ?? null,
          cpiScore: previousCER?.cpiScore ?? null,
          cerScore: previousCER?.cerScore ?? null,
          cerRating: previousCER?.cerRating ?? null,
          residualRiskScore: previousRR?.residualRiskScore ?? null,
          residualRiskRating: previousRR?.residualRiskRating ?? null,
        },
        after: {
          cqiScore: currentCER?.cqiScore ?? null,
          cpiScore: currentCER?.cpiScore ?? null,
          cerScore: currentCER?.cerScore ?? null,
          cerRating: currentCER?.cerRating ?? null,
          residualRiskScore: currentRR?.residualRiskScore ?? null,
          residualRiskRating: currentRR?.residualRiskRating ?? null,
        },
        impact: {
          cqiDelta: computeDelta(currentCER?.cqiScore, previousCER?.cqiScore),
          cpiDelta: computeDelta(currentCER?.cpiScore, previousCER?.cpiScore),
          cerDelta: computeDelta(currentCER?.cerScore, previousCER?.cerScore),
          residualRiskDelta: computeDelta(currentRR?.residualRiskScore, previousRR?.residualRiskScore),
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
