import { Router, type Request, type Response, type NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validateQuery, validateBody } from '../middleware/validation.middleware.js';
import { NotFoundError } from '../middleware/error-handler.middleware.js';
import {
  calculateLikelihood,
  calculateImpact,
  calculateInherentRisk,
} from '../services/risk-calculator/index.js';
import { ProductComplexityCategory } from '../types/enums.js';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const getQuerySchema = {
  auId: { type: 'number' as const, required: true, min: 1 },
  periodId: { type: 'number' as const, min: 1 },
};

const postBodySchema = {
  auId: { type: 'number' as const, required: true, min: 1 },
  periodId: { type: 'number' as const, required: true, min: 1 },
  volumeGrowthPercent: { type: 'number' as const, required: true },
  systemComplexityScore: { type: 'number' as const, required: true, min: 5, max: 25 },
  productComplexityCategory: { type: 'string' as const, required: true, enum: ['Low', 'Medium', 'High'] },
  regulatoryReturnsCount: { type: 'number' as const, required: true, min: 0 },
  complianceBreachCount: { type: 'number' as const, required: true, min: 0 },
  icofrFailureCount: { type: 'number' as const, required: true, min: 0 },
  customerComplaintCount: { type: 'number' as const, required: true, min: 0 },
  businessImpact: { type: 'number' as const, required: true, min: 5, max: 25 },
  reputationalImpact: { type: 'number' as const, required: true, min: 5, max: 20 },
  financialPenalty: { type: 'number' as const, required: true, min: 5, max: 25 },
  glImpact: { type: 'number' as const, required: true, min: 15, max: 25 },
};

// Apply auth
router.use(authenticate);

// GET /api/inherent-risk — get inherent risk for an AU and period
router.get(
  '/',
  authorize('inherent-risk', 'read'),
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

      const inherentRisk = await prisma.inherentRisk.findUnique({
        where: { auId_periodId: { auId, periodId } },
      });

      if (!inherentRisk) {
        throw new NotFoundError(`Inherent risk not found for AU ${auId} and period ${periodId}.`);
      }

      res.json({
        auId: inherentRisk.auId,
        periodId: inherentRisk.periodId,
        likelihoodBreakdown: {
          volumeGrowth: inherentRisk.volumeGrowthScore,
          complexity: inherentRisk.complexityScore,
          regulatoryReturns: inherentRisk.regulatoryReturnsScore,
          complianceBreaches: inherentRisk.complianceBreachesScore,
          controlFailures: inherentRisk.controlFailuresScore,
          customerComplaints: inherentRisk.customerComplaintsScore,
          rawAvg: inherentRisk.likelihoodRawAvg,
          scaledScore: inherentRisk.likelihoodScore,
          rating: inherentRisk.likelihoodRating,
        },
        impactBreakdown: {
          businessImpact: inherentRisk.businessImpactScore,
          reputationalImpact: inherentRisk.reputationalImpactScore,
          financialPenalty: inherentRisk.financialPenaltyScore,
          glImpact: inherentRisk.glImpactScore,
          overallScore: inherentRisk.impactScore,
          rating: inherentRisk.impactRating,
        },
        inherentRiskScore: inherentRisk.inherentRiskScore,
        inherentRiskRating: inherentRisk.inherentRiskRating,
      });
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/inherent-risk — calculate and save inherent risk for an AU
router.post(
  '/',
  authorize('inherent-risk', 'write'),
  validateBody(postBodySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        auId,
        periodId,
        volumeGrowthPercent,
        systemComplexityScore,
        productComplexityCategory,
        regulatoryReturnsCount,
        complianceBreachCount,
        icofrFailureCount,
        customerComplaintCount,
        businessImpact,
        reputationalImpact,
        financialPenalty,
        glImpact,
      } = req.body;

      // Verify AU exists
      const au = await prisma.assessmentUnit.findUnique({
        where: { id: auId },
        select: { id: true },
      });
      if (!au) {
        throw new NotFoundError(`Assessment Unit ${auId} not found.`);
      }

      // Calculate likelihood
      const likelihoodResult = calculateLikelihood({
        volumeGrowthPercent,
        systemComplexityScore,
        productComplexityCategory: productComplexityCategory as ProductComplexityCategory,
        regulatoryReturnsCount,
        complianceBreachCount,
        icofrFailureCount,
        customerComplaintCount,
      });

      // Calculate impact
      const impactResult = calculateImpact({
        businessImpact,
        mediaImpact: reputationalImpact,
        financialPenalty,
        glImpact,
      });

      // Calculate inherent risk
      const irResult = calculateInherentRisk({
        likelihoodScore: likelihoodResult.scaledScore,
        impactScore: impactResult.overallScore,
      });

      // Upsert into database
      const saved = await prisma.inherentRisk.upsert({
        where: { auId_periodId: { auId, periodId } },
        update: {
          volumeGrowthScore: likelihoodResult.parameterScores.volumeGrowth,
          complexityScore: likelihoodResult.parameterScores.complexity,
          regulatoryReturnsScore: likelihoodResult.parameterScores.regulatoryReturns,
          complianceBreachesScore: likelihoodResult.parameterScores.complianceBreaches,
          controlFailuresScore: likelihoodResult.parameterScores.icofrFailures,
          customerComplaintsScore: likelihoodResult.parameterScores.customerComplaints,
          likelihoodRawAvg: likelihoodResult.rawAverage,
          likelihoodScore: likelihoodResult.scaledScore,
          likelihoodRating: likelihoodResult.rating,
          businessImpactScore: impactResult.parameterScores.businessImpact,
          reputationalImpactScore: impactResult.parameterScores.mediaImpact,
          financialPenaltyScore: impactResult.parameterScores.financialPenalty,
          glImpactScore: impactResult.parameterScores.glImpact,
          impactScore: impactResult.overallScore,
          impactRating: mapImpactRating(impactResult.overallScore),
          inherentRiskScore: irResult.inherentRiskScore,
          inherentRiskRating: irResult.rating,
          assessmentDate: new Date(),
        },
        create: {
          auId,
          periodId,
          volumeGrowthScore: likelihoodResult.parameterScores.volumeGrowth,
          complexityScore: likelihoodResult.parameterScores.complexity,
          regulatoryReturnsScore: likelihoodResult.parameterScores.regulatoryReturns,
          complianceBreachesScore: likelihoodResult.parameterScores.complianceBreaches,
          controlFailuresScore: likelihoodResult.parameterScores.icofrFailures,
          customerComplaintsScore: likelihoodResult.parameterScores.customerComplaints,
          likelihoodRawAvg: likelihoodResult.rawAverage,
          likelihoodScore: likelihoodResult.scaledScore,
          likelihoodRating: likelihoodResult.rating,
          businessImpactScore: impactResult.parameterScores.businessImpact,
          reputationalImpactScore: impactResult.parameterScores.mediaImpact,
          financialPenaltyScore: impactResult.parameterScores.financialPenalty,
          glImpactScore: impactResult.parameterScores.glImpact,
          impactScore: impactResult.overallScore,
          impactRating: mapImpactRating(impactResult.overallScore),
          inherentRiskScore: irResult.inherentRiskScore,
          inherentRiskRating: irResult.rating,
          assessmentDate: new Date(),
        },
      });

      res.status(201).json({
        id: saved.id,
        auId: saved.auId,
        periodId: saved.periodId,
        likelihoodBreakdown: {
          volumeGrowth: saved.volumeGrowthScore,
          complexity: saved.complexityScore,
          regulatoryReturns: saved.regulatoryReturnsScore,
          complianceBreaches: saved.complianceBreachesScore,
          controlFailures: saved.controlFailuresScore,
          customerComplaints: saved.customerComplaintsScore,
          rawAvg: saved.likelihoodRawAvg,
          scaledScore: saved.likelihoodScore,
          rating: saved.likelihoodRating,
        },
        impactBreakdown: {
          businessImpact: saved.businessImpactScore,
          reputationalImpact: saved.reputationalImpactScore,
          financialPenalty: saved.financialPenaltyScore,
          glImpact: saved.glImpactScore,
          overallScore: saved.impactScore,
          rating: saved.impactRating,
        },
        inherentRiskScore: saved.inherentRiskScore,
        inherentRiskRating: saved.inherentRiskRating,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Helper: map impact score to a descriptive rating
function mapImpactRating(score: number): string {
  if (score >= 25) return 'Severe';
  if (score >= 20) return 'Major';
  if (score >= 15) return 'Moderate';
  if (score >= 10) return 'Minor';
  return 'Insignificant';
}

export default router;
