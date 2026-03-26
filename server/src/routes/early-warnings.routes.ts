import { Router, type Request, type Response, type NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validateQuery, validateParams } from '../middleware/validation.middleware.js';
import { NotFoundError } from '../middleware/error-handler.middleware.js';
import { EarlyWarningType } from '../types/enums.js';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const listQuerySchema = {
  periodId: { type: 'number' as const, min: 1 },
};

const auIdParamsSchema = {
  auId: { type: 'number' as const, required: true, min: 1 },
};

// Apply auth + RBAC to all routes
router.use(authenticate);
router.use(authorize('early-warnings', 'read'));

// Traffic light severity
type Severity = 'Red' | 'Amber' | 'Green';

interface EarlyWarning {
  auId: number;
  auName: string;
  auCode: string;
  type: string;
  severity: Severity;
  message: string;
  currentValue: number | null;
  previousValue: number | null;
  changePercent: number | null;
}

/**
 * Generate early warnings for a set of AUs given a period.
 */
async function generateWarnings(auIds: number[], periodId: number): Promise<EarlyWarning[]> {
  const warnings: EarlyWarning[] = [];

  // Find previous period
  const previousPeriod = await prisma.assessmentPeriod.findFirst({
    where: { id: { lt: periodId } },
    orderBy: { id: 'desc' },
  });

  if (!previousPeriod) {
    return warnings; // No previous period to compare against
  }

  const previousPeriodId = previousPeriod.id;

  // Fetch AU info
  const aus = await prisma.assessmentUnit.findMany({
    where: { id: { in: auIds } },
    select: { id: true, name: true, code: true },
  });
  const auMap = new Map(aus.map((a) => [a.id, a]));

  // --- Check 1: Deteriorating risk trend ---
  // Residual risk aggregateResidual increased >10% vs previous period
  const currentResidualRisks = await prisma.residualRisk.findMany({
    where: { auId: { in: auIds }, periodId },
  });
  const previousResidualRisks = await prisma.residualRisk.findMany({
    where: { auId: { in: auIds }, periodId: previousPeriodId },
  });
  const prevRRMap = new Map(previousResidualRisks.map((r) => [r.auId, r]));

  for (const current of currentResidualRisks) {
    const previous = prevRRMap.get(current.auId);
    if (previous && previous.aggregateResidual != null && current.aggregateResidual != null && previous.aggregateResidual > 0) {
      const changePct = ((current.aggregateResidual - previous.aggregateResidual) / previous.aggregateResidual) * 100;
      if (changePct > 10) {
        const au = auMap.get(current.auId);
        warnings.push({
          auId: current.auId,
          auName: au?.name ?? '',
          auCode: au?.code ?? '',
          type: EarlyWarningType.DeterioratingRisk,
          severity: changePct > 25 ? 'Red' : 'Amber',
          message: `Residual risk increased by ${changePct.toFixed(1)}% compared to previous period.`,
          currentValue: current.aggregateResidual,
          previousValue: previous.aggregateResidual,
          changePercent: changePct,
        });
      }
    }
  }

  // --- Check 2: Approaching failure ---
  // CPA decreased across consecutive periods
  const currentCERs = await prisma.controlEnvironmentRating.findMany({
    where: { auId: { in: auIds }, periodId },
  });
  const previousCERs = await prisma.controlEnvironmentRating.findMany({
    where: { auId: { in: auIds }, periodId: previousPeriodId },
  });
  const prevCERMap = new Map(previousCERs.map((c) => [c.auId, c]));

  for (const current of currentCERs) {
    const previous = prevCERMap.get(current.auId);
    if (previous && current.cpiScore < previous.cpiScore) {
      const au = auMap.get(current.auId);
      const decrease = previous.cpiScore - current.cpiScore;
      warnings.push({
        auId: current.auId,
        auName: au?.name ?? '',
        auCode: au?.code ?? '',
        type: EarlyWarningType.ApproachingFailure,
        severity: decrease > 15 ? 'Red' : 'Amber',
        message: `Control performance (CPI) decreased from ${previous.cpiScore.toFixed(1)}% to ${current.cpiScore.toFixed(1)}%.`,
        currentValue: current.cpiScore,
        previousValue: previous.cpiScore,
        changePercent: previous.cpiScore > 0 ? ((current.cpiScore - previous.cpiScore) / previous.cpiScore) * 100 : null,
      });
    }
  }

  // --- Check 3: Breach trend ---
  // Increasing compliance breaches score across periods
  const currentIRs = await prisma.inherentRisk.findMany({
    where: { auId: { in: auIds }, periodId },
  });
  const previousIRs = await prisma.inherentRisk.findMany({
    where: { auId: { in: auIds }, periodId: previousPeriodId },
  });
  const prevIRMap = new Map(previousIRs.map((ir) => [ir.auId, ir]));

  for (const current of currentIRs) {
    const previous = prevIRMap.get(current.auId);
    if (previous && current.complianceBreachesScore > previous.complianceBreachesScore) {
      const au = auMap.get(current.auId);
      warnings.push({
        auId: current.auId,
        auName: au?.name ?? '',
        auCode: au?.code ?? '',
        type: EarlyWarningType.BreachTrend,
        severity: current.complianceBreachesScore >= 25 ? 'Red' : 'Amber',
        message: `Compliance breaches score increased from ${previous.complianceBreachesScore} to ${current.complianceBreachesScore}.`,
        currentValue: current.complianceBreachesScore,
        previousValue: previous.complianceBreachesScore,
        changePercent: previous.complianceBreachesScore > 0
          ? ((current.complianceBreachesScore - previous.complianceBreachesScore) / previous.complianceBreachesScore) * 100
          : null,
      });
    }
  }

  return warnings;
}

// GET /api/early-warnings — list all early warnings across AUs
router.get(
  '/',
  validateQuery(listQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let periodId = req.query.periodId ? Number(req.query.periodId) : undefined;

      // Resolve period
      if (!periodId) {
        const currentPeriod = await prisma.assessmentPeriod.findFirst({
          where: { isCurrent: true },
        });
        if (!currentPeriod) {
          throw new NotFoundError('No current assessment period found.');
        }
        periodId = currentPeriod.id;
      }

      // Get all active AU ids
      const aus = await prisma.assessmentUnit.findMany({
        where: { isActive: true },
        select: { id: true },
      });
      const auIds = aus.map((a) => a.id);

      const warnings = await generateWarnings(auIds, periodId);

      res.json({
        periodId,
        totalWarnings: warnings.length,
        warnings,
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/early-warnings/:auId — early warnings for a specific AU
router.get(
  '/:auId',
  validateParams(auIdParamsSchema),
  validateQuery(listQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auId = Number(req.params.auId);
      let periodId = req.query.periodId ? Number(req.query.periodId) : undefined;

      // Verify AU exists
      const au = await prisma.assessmentUnit.findUnique({
        where: { id: auId },
        select: { id: true, name: true },
      });
      if (!au) {
        throw new NotFoundError(`Assessment Unit ${auId} not found.`);
      }

      // Resolve period
      if (!periodId) {
        const currentPeriod = await prisma.assessmentPeriod.findFirst({
          where: { isCurrent: true },
        });
        if (!currentPeriod) {
          throw new NotFoundError('No current assessment period found.');
        }
        periodId = currentPeriod.id;
      }

      const warnings = await generateWarnings([auId], periodId);

      res.json({
        auId,
        auName: au.name,
        periodId,
        totalWarnings: warnings.length,
        warnings,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
