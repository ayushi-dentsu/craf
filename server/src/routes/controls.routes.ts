import { Router, type Request, type Response, type NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validateQuery, validateParams, validateBody } from '../middleware/validation.middleware.js';
import { NotFoundError } from '../middleware/error-handler.middleware.js';
import {
  calculateCQA,
  calculateCQI,
  calculateCPA,
  calculateCPI,
  calculateCER,
  calculateResidualRisk,
  aggregateResidualRisk,
  type CQIControlInput,
  type CPIControlInput,
} from '../services/risk-calculator/index.js';
import { ControlRiskType, KCIResult, SelfAssessmentResult, ControlTestingResult } from '../types/enums.js';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const controlsQuerySchema = {
  auId: { type: 'number' as const, min: 1 },
  obligationId: { type: 'number' as const, min: 1 },
};

const controlIdParamsSchema = {
  controlId: { type: 'number' as const, required: true, min: 1 },
};

const auIdParamsSchema = {
  auId: { type: 'number' as const, required: true, min: 1 },
};

const periodQuerySchema = {
  periodId: { type: 'number' as const, min: 1 },
};

// Apply auth + RBAC to all routes
router.use(authenticate);
router.use(authorize('controls', 'read'));

// GET /api/controls — list controls with filters
router.get(
  '/',
  validateQuery(controlsQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { auId, obligationId } = req.query;

      const where: Record<string, unknown> = {};
      if (obligationId) where.obligationId = Number(obligationId);
      if (auId) {
        where.obligation = { auId: Number(auId) };
      }

      const controls = await prisma.control.findMany({
        where,
        include: {
          obligation: { select: { id: true, code: true, description: true, auId: true } },
          qualityAssessments: true,
          performanceAssessments: true,
        },
        orderBy: { name: 'asc' },
      });

      res.json(controls);
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/controls/:controlId — control detail with obligation info
router.get(
  '/:controlId',
  validateParams(controlIdParamsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const controlId = Number(req.params.controlId);

      const control = await prisma.control.findUnique({
        where: { id: controlId },
        include: {
          obligation: {
            select: {
              id: true,
              code: true,
              description: true,
              auId: true,
              frequency: true,
              criticality: true,
            },
          },
          qualityAssessments: true,
          performanceAssessments: true,
        },
      });

      if (!control) {
        throw new NotFoundError(`Control ${controlId} not found.`);
      }

      res.json(control);
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/controls/:controlId/quality — CQA detail (all quality assessments across periods)
router.get(
  '/:controlId/quality',
  validateParams(controlIdParamsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const controlId = Number(req.params.controlId);

      const control = await prisma.control.findUnique({
        where: { id: controlId },
        select: { id: true, code: true, name: true },
      });

      if (!control) {
        throw new NotFoundError(`Control ${controlId} not found.`);
      }

      const qualityAssessments = await prisma.controlQuality.findMany({
        where: { controlId },
        include: { period: { select: { id: true, name: true } } },
        orderBy: { periodId: 'asc' },
      });

      res.json({ control, qualityAssessments });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/controls/:controlId/performance — CPA detail (all performance assessments across periods)
router.get(
  '/:controlId/performance',
  validateParams(controlIdParamsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const controlId = Number(req.params.controlId);

      const control = await prisma.control.findUnique({
        where: { id: controlId },
        select: { id: true, code: true, name: true },
      });

      if (!control) {
        throw new NotFoundError(`Control ${controlId} not found.`);
      }

      const performanceAssessments = await prisma.controlPerformance.findMany({
        where: { controlId },
        include: { period: { select: { id: true, name: true } } },
        orderBy: { periodId: 'asc' },
      });

      res.json({ control, performanceAssessments });
    } catch (error) {
      next(error);
    }
  },
);

// ── Recalculate CER + Residual Risk for an AU after CQA/CPA change ──

async function recalculateAU(auId: number, periodId: number) {
  // Gather all controls for this AU
  const obligations = await prisma.complianceObligation.findMany({
    where: { auId },
    include: { controls: true },
  });
  const controlIds = obligations.flatMap((o) => o.controls.map((c) => c.id));

  const cqaRecords = await prisma.controlQuality.findMany({
    where: { controlId: { in: controlIds }, periodId },
  });
  const cpaRecords = await prisma.controlPerformance.findMany({
    where: { controlId: { in: controlIds }, periodId },
  });

  // CQI
  const cqiInputs: CQIControlInput[] = cqaRecords.map((r) => ({ cqaRawScore: r.cqaRawScore }));
  const obligationsWithoutControl = obligations.filter(
    (o) => o.controls.length === 0,
  ).length;
  for (let i = 0; i < obligationsWithoutControl; i++) {
    cqiInputs.push({ cqaRawScore: null });
  }
  const cqi = calculateCQI(cqiInputs);

  // CPI
  const cpiInputs: CPIControlInput[] = cpaRecords.map((r) => ({ cpaRawScore: r.cpaRawScore }));
  for (let i = 0; i < obligationsWithoutControl; i++) {
    cpiInputs.push({ cpaRawScore: null });
  }
  const cpi = calculateCPI(cpiInputs);

  // CER
  const cer = calculateCER({ cqiInterpScore: cqi.interpScore, cpiInterpScore: cpi.interpScore });

  // Upsert CER
  await prisma.controlEnvironmentRating.upsert({
    where: { auId_periodId: { auId, periodId } },
    update: {
      cqiWeightedAvg: cqi.weightedAvg,
      cqiScore: cqi.cqiScore,
      cqiInterpScore: cqi.interpScore,
      cpiWeightedAvg: cpi.weightedAvg,
      cpiScore: cpi.cpiScore,
      cpiInterpScore: cpi.interpScore,
      cerScore: cer.cerScore,
      cerRating: cer.rating,
    },
    create: {
      auId,
      periodId,
      cqiWeightedAvg: cqi.weightedAvg,
      cqiScore: cqi.cqiScore,
      cqiInterpScore: cqi.interpScore,
      cpiWeightedAvg: cpi.weightedAvg,
      cpiScore: cpi.cpiScore,
      cpiInterpScore: cpi.interpScore,
      cerScore: cer.cerScore,
      cerRating: cer.rating,
    },
  });

  // Residual Risk
  const ir = await prisma.inherentRisk.findUnique({
    where: { auId_periodId: { auId, periodId } },
  });
  if (ir) {
    const rr = calculateResidualRisk({
      inherentRiskScore: ir.inherentRiskScore,
      cerScore: cer.cerScore,
    });
    const allRatings = cqiInputs.map(() => rr.rating);
    const agg = aggregateResidualRisk({ ratings: allRatings });

    await prisma.residualRisk.upsert({
      where: { auId_periodId: { auId, periodId } },
      update: {
        inherentRiskScore: ir.inherentRiskScore,
        cerScore: cer.cerScore,
        residualRiskScore: rr.residualRiskScore,
        residualRiskRating: rr.rating,
        aggregateResidual: agg.aggregateResidual,
        aggregateRating: agg.aggregateRating,
        assessmentDate: new Date(),
      },
      create: {
        auId,
        periodId,
        inherentRiskScore: ir.inherentRiskScore,
        cerScore: cer.cerScore,
        residualRiskScore: rr.residualRiskScore,
        residualRiskRating: rr.rating,
        aggregateResidual: agg.aggregateResidual,
        aggregateRating: agg.aggregateRating,
        assessmentDate: new Date(),
      },
    });
  }

  return { cqi, cpi, cer };
}

// POST /api/controls/:controlId/quality — set CQA inputs, recalculate pipeline
router.post(
  '/:controlId/quality',
  authorize('controls', 'write'),
  validateParams(controlIdParamsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const controlId = Number(req.params.controlId);
      const { periodId, monitoringScore, automationScore, typeScore, documentationScore } = req.body;

      const control = await prisma.control.findUnique({
        where: { id: controlId },
        include: { obligation: { select: { auId: true } } },
      });
      if (!control) throw new NotFoundError(`Control ${controlId} not found.`);

      const cqa = calculateCQA({ monitoringScore, automationScore, typeScore, documentationScore });

      await prisma.controlQuality.upsert({
        where: { controlId_periodId: { controlId, periodId } },
        update: {
          monitoringScore,
          automationScore,
          typeScore,
          documentationScore,
          cqaRawScore: cqa.rawScore,
          cqaScaledScore: cqa.scaledScore,
          controlCategory: cqa.category,
        },
        create: {
          controlId,
          periodId,
          monitoringScore,
          automationScore,
          typeScore,
          documentationScore,
          cqaRawScore: cqa.rawScore,
          cqaScaledScore: cqa.scaledScore,
          controlCategory: cqa.category,
        },
      });

      const cascade = await recalculateAU(control.obligation.auId, periodId);

      res.json({ cqa, cascade });
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/controls/:controlId/performance — set CPA inputs, recalculate pipeline
router.post(
  '/:controlId/performance',
  authorize('controls', 'write'),
  validateParams(controlIdParamsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const controlId = Number(req.params.controlId);
      const { periodId, controlRiskType, kciLinked, kciResult, selfAssessmentResult, controlTestingResult } = req.body;

      const control = await prisma.control.findUnique({
        where: { id: controlId },
        include: { obligation: { select: { auId: true } } },
      });
      if (!control) throw new NotFoundError(`Control ${controlId} not found.`);

      const cpa = calculateCPA({
        controlRiskType: controlRiskType as ControlRiskType,
        kciLinked,
        kciResult: kciResult as KCIResult | null,
        selfAssessmentResult: selfAssessmentResult as SelfAssessmentResult,
        controlTestingResult: controlTestingResult as ControlTestingResult,
      });

      await prisma.controlPerformance.upsert({
        where: { controlId_periodId: { controlId, periodId } },
        update: {
          controlRiskType,
          kciLinked,
          kciResult,
          selfAssessmentResult,
          kciSelfAssessmentScore: cpa.kciSelfAssessmentScore,
          controlTestingResult,
          controlTestingScore: cpa.controlTestingScore,
          cpaRawScore: cpa.rawScore,
          cpaScaledScore: cpa.scaledScore,
          performanceCategory: cpa.category,
        },
        create: {
          controlId,
          periodId,
          controlRiskType,
          kciLinked,
          kciResult,
          selfAssessmentResult,
          kciSelfAssessmentScore: cpa.kciSelfAssessmentScore,
          controlTestingResult,
          controlTestingScore: cpa.controlTestingScore,
          cpaRawScore: cpa.rawScore,
          cpaScaledScore: cpa.scaledScore,
          performanceCategory: cpa.category,
        },
      });

      const cascade = await recalculateAU(control.obligation.auId, periodId);

      res.json({ cpa, cascade });
    } catch (error) {
      next(error);
    }
  },
);

// ── Control Environment Router ──
// Mounted at /api/control-environment

const controlEnvironmentRouter = Router();
controlEnvironmentRouter.use(authenticate);
controlEnvironmentRouter.use(authorize('controls', 'read'));

// GET /api/control-environment/:auId — CER with CQI/CPI breakdown
controlEnvironmentRouter.get(
  '/:auId',
  validateParams(auIdParamsSchema),
  validateQuery(periodQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auId = Number(req.params.auId);
      const periodId = req.query.periodId ? Number(req.query.periodId) : undefined;

      const au = await prisma.assessmentUnit.findUnique({
        where: { id: auId },
        select: { id: true, code: true, name: true },
      });

      if (!au) {
        throw new NotFoundError(`Assessment Unit ${auId} not found.`);
      }

      // Resolve period: use provided periodId or find current period
      let resolvedPeriodId = periodId;
      if (!resolvedPeriodId) {
        const currentPeriod = await prisma.assessmentPeriod.findFirst({
          where: { isCurrent: true },
        });
        if (currentPeriod) resolvedPeriodId = currentPeriod.id;
      }

      // Fetch CER for the AU and period
      const cer = resolvedPeriodId
        ? await prisma.controlEnvironmentRating.findUnique({
            where: { auId_periodId: { auId, periodId: resolvedPeriodId } },
          })
        : null;

      // Fetch controls for this AU with quality/performance assessments for the period
      const obligations = await prisma.complianceObligation.findMany({
        where: { auId },
        include: {
          controls: {
            include: {
              qualityAssessments: resolvedPeriodId
                ? { where: { periodId: resolvedPeriodId } }
                : false,
              performanceAssessments: resolvedPeriodId
                ? { where: { periodId: resolvedPeriodId } }
                : false,
            },
          },
        },
      });

      // Build CQI/CPI distribution by counting controls per category
      const cqiDistribution: Record<string, number> = {};
      const cpiDistribution: Record<string, number> = {};
      for (const ob of obligations) {
        for (const ctrl of ob.controls) {
          const cqa = ctrl.qualityAssessments?.[0];
          const cpa = ctrl.performanceAssessments?.[0];
          if (cqa) {
            cqiDistribution[cqa.controlCategory] =
              (cqiDistribution[cqa.controlCategory] || 0) + 1;
          }
          if (cpa) {
            cpiDistribution[cpa.performanceCategory] =
              (cpiDistribution[cpa.performanceCategory] || 0) + 1;
          }
        }
      }

      res.json({
        assessmentUnit: au,
        periodId: resolvedPeriodId ?? null,
        cer: cer
          ? {
              cqiWeightedAvg: cer.cqiWeightedAvg,
              cqiScore: cer.cqiScore,
              cqiInterpScore: cer.cqiInterpScore,
              cpiWeightedAvg: cer.cpiWeightedAvg,
              cpiScore: cer.cpiScore,
              cpiInterpScore: cer.cpiInterpScore,
              cerScore: cer.cerScore,
              cerRating: cer.cerRating,
            }
          : null,
        cqiDistribution,
        cpiDistribution,
      });
    } catch (error) {
      next(error);
    }
  },
);

export { controlEnvironmentRouter };
export default router;
