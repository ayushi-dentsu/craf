import { Router, type Request, type Response, type NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validateQuery, validateParams } from '../middleware/validation.middleware.js';
import { NotFoundError } from '../middleware/error-handler.middleware.js';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const listQuerySchema = {
  businessArea: { type: 'string' as const },
  themeId: { type: 'number' as const, min: 1 },
  isActive: { type: 'string' as const, enum: ['true', 'false'] },
};

const auIdParamsSchema = {
  auId: { type: 'number' as const, required: true, min: 1 },
};

const detailQuerySchema = {
  periodId: { type: 'number' as const, min: 1 },
};

// Apply auth + RBAC to all routes
router.use(authenticate);
router.use(authorize('assessment-units', 'read'));

// GET /api/assessment-units — list with filters
router.get(
  '/',
  validateQuery(listQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessArea, themeId, isActive } = req.query;

      const where: Record<string, unknown> = {};
      if (businessArea) where.businessArea = businessArea;
      if (themeId) where.themeId = Number(themeId);
      if (isActive !== undefined) where.isActive = isActive === 'true';

      const assessmentUnits = await prisma.assessmentUnit.findMany({
        where,
        include: { theme: { select: { id: true, name: true } } },
        orderBy: { name: 'asc' },
      });

      res.json(assessmentUnits);
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/assessment-units/:auId — basic AU info
router.get(
  '/:auId',
  validateParams(auIdParamsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auId = Number(req.params.auId);

      const au = await prisma.assessmentUnit.findUnique({
        where: { id: auId },
        include: {
          theme: { select: { id: true, name: true } },
          volumeDefinition: true,
          productComplexity: true,
          systemComplexities: true,
        },
      });

      if (!au) {
        throw new NotFoundError(`Assessment Unit ${auId} not found.`);
      }

      res.json(au);
    } catch (error) {
      next(error);
    }
  },
);


// GET /api/assessment-units/:auId/detail — full AU detail with risk data
router.get(
  '/:auId/detail',
  validateParams(auIdParamsSchema),
  validateQuery(detailQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auId = Number(req.params.auId);
      const periodId = req.query.periodId ? Number(req.query.periodId) : undefined;

      const au = await prisma.assessmentUnit.findUnique({
        where: { id: auId },
        include: { theme: { select: { name: true } } },
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

      // Fetch inherent risk for the period
      const inherentRisk = resolvedPeriodId
        ? await prisma.inherentRisk.findUnique({
            where: { auId_periodId: { auId, periodId: resolvedPeriodId } },
          })
        : null;

      // Fetch control environment rating
      const cer = resolvedPeriodId
        ? await prisma.controlEnvironmentRating.findUnique({
            where: { auId_periodId: { auId, periodId: resolvedPeriodId } },
          })
        : null;

      // Fetch residual risk (current and previous period for comparison)
      const residualRisk = resolvedPeriodId
        ? await prisma.residualRisk.findUnique({
            where: { auId_periodId: { auId, periodId: resolvedPeriodId } },
          })
        : null;

      let previousResidualRisk: { residualRiskScore: number } | null = null;
      if (resolvedPeriodId) {
        const previousPeriod = await prisma.assessmentPeriod.findFirst({
          where: { id: { lt: resolvedPeriodId } },
          orderBy: { id: 'desc' },
        });
        if (previousPeriod) {
          previousResidualRisk = await prisma.residualRisk.findUnique({
            where: { auId_periodId: { auId, periodId: previousPeriod.id } },
            select: { residualRiskScore: true },
          });
        }
      }

      // Fetch obligations with controls and their quality/performance data
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
        orderBy: { criticality: 'asc' },
      });

      // Build CQI/CPI distribution from control data
      const cqiDistribution: Record<string, number> = {};
      const cpiDistribution: Record<string, number> = {};
      for (const ob of obligations) {
        for (const ctrl of ob.controls) {
          const cqa = ctrl.qualityAssessments?.[0];
          const cpa = ctrl.performanceAssessments?.[0];
          if (cqa) {
            cqiDistribution[cqa.controlCategory] = (cqiDistribution[cqa.controlCategory] || 0) + 1;
          }
          if (cpa) {
            cpiDistribution[cpa.performanceCategory] = (cpiDistribution[cpa.performanceCategory] || 0) + 1;
          }
        }
      }

      // Compute previous period change percentage
      let previousPeriodScore: number | null = null;
      let changePct: number | null = null;
      if (previousResidualRisk && residualRisk) {
        previousPeriodScore = previousResidualRisk.residualRiskScore;
        if (previousPeriodScore !== 0) {
          changePct = ((residualRisk.residualRiskScore - previousPeriodScore) / previousPeriodScore) * 100;
        }
      }

      const response = {
        auInfo: {
          id: au.id,
          code: au.code,
          name: au.name,
          businessArea: au.businessArea,
          themeName: au.theme.name,
          ownerName: au.ownerName,
        },
        inherentRisk: inherentRisk
          ? {
              likelihoodScore: inherentRisk.likelihoodScore,
              likelihoodRating: inherentRisk.likelihoodRating,
              likelihoodParameters: {
                volumeGrowth: { value: inherentRisk.volumeGrowthScore, score: inherentRisk.volumeGrowthScore },
                complexity: { value: inherentRisk.complexityScore, score: inherentRisk.complexityScore },
                regulatoryReturns: { value: inherentRisk.regulatoryReturnsScore, score: inherentRisk.regulatoryReturnsScore },
                complianceBreaches: { value: inherentRisk.complianceBreachesScore, score: inherentRisk.complianceBreachesScore },
                controlFailures: { value: inherentRisk.controlFailuresScore, score: inherentRisk.controlFailuresScore },
                customerComplaints: { value: inherentRisk.customerComplaintsScore, score: inherentRisk.customerComplaintsScore },
              },
              impactScore: inherentRisk.impactScore,
              impactRating: inherentRisk.impactRating,
              impactParameters: {
                businessImpact: { value: String(inherentRisk.businessImpactScore), score: inherentRisk.businessImpactScore },
                reputationalImpact: { value: String(inherentRisk.reputationalImpactScore), score: inherentRisk.reputationalImpactScore },
                financialPenalty: { value: String(inherentRisk.financialPenaltyScore), score: inherentRisk.financialPenaltyScore },
                glImpact: { value: String(inherentRisk.glImpactScore), score: inherentRisk.glImpactScore },
              },
              inherentRiskScore: inherentRisk.inherentRiskScore,
              inherentRiskRating: inherentRisk.inherentRiskRating,
            }
          : null,
        controlEnvironment: cer
          ? {
              cqiScore: cer.cqiScore,
              cqiInterpScore: cer.cqiInterpScore,
              cqiRating: getCqiRating(cer.cqiScore),
              cqiDistribution,
              cpiScore: cer.cpiScore,
              cpiInterpScore: cer.cpiInterpScore,
              cpiRating: getCpiRating(cer.cpiScore),
              cpiDistribution,
              cerScore: cer.cerScore,
              cerRating: cer.cerRating,
            }
          : null,
        residualRisk: residualRisk
          ? {
              residualRiskScore: residualRisk.residualRiskScore,
              residualRiskRating: residualRisk.residualRiskRating,
              aggregateResidual: residualRisk.aggregateResidual,
              aggregateRating: residualRisk.aggregateRating,
              previousPeriodScore,
              changePct,
            }
          : null,
        obligations: obligations.map((ob) => ({
          id: ob.id,
          code: ob.code,
          description: ob.description,
          frequency: ob.frequency ?? '',
          criticality: ob.criticality ?? '',
          controlCount: ob.controls.length,
          controls: ob.controls.map((ctrl) => {
            const cqa = ctrl.qualityAssessments?.[0];
            const cpa = ctrl.performanceAssessments?.[0];
            return {
              id: ctrl.id,
              name: ctrl.name,
              controlType: ctrl.controlType,
              cqaScaledScore: cqa?.cqaScaledScore ?? 0,
              cpaScaledScore: cpa?.cpaScaledScore ?? 0,
              residualRiskRating: '',
            };
          }),
        })),
        earlyWarnings: [],
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/assessment-units/:auId/volume-definition
router.get(
  '/:auId/volume-definition',
  validateParams(auIdParamsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auId = Number(req.params.auId);

      const au = await prisma.assessmentUnit.findUnique({
        where: { id: auId },
        select: { id: true },
      });

      if (!au) {
        throw new NotFoundError(`Assessment Unit ${auId} not found.`);
      }

      const volumeDefinition = await prisma.aUVolumeDefinition.findUnique({
        where: { auId },
      });

      if (!volumeDefinition) {
        throw new NotFoundError(`Volume definition not found for Assessment Unit ${auId}.`);
      }

      res.json(volumeDefinition);
    } catch (error) {
      next(error);
    }
  },
);

// Helper: map CQI score to rating
function getCqiRating(cqiScore: number): string {
  if (cqiScore >= 80) return 'Effective';
  if (cqiScore >= 70) return 'Meets Requirements';
  if (cqiScore >= 60) return 'Partially Effective';
  if (cqiScore >= 40) return 'Improvement Needed';
  return 'Significant Improvement Needed';
}

// Helper: map CPI score to rating
function getCpiRating(cpiScore: number): string {
  if (cpiScore >= 80) return 'Effective';
  if (cpiScore >= 70) return 'Meets Requirements';
  if (cpiScore >= 60) return 'Partially Effective';
  if (cpiScore >= 40) return 'Improvement Needed';
  return 'Significant Improvement Needed';
}

export default router;
