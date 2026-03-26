/**
 * AU Detail Service
 *
 * Assembles full AU detail: inherent risk breakdown, control environment
 * (CQI/CPI/CER), residual risk with previous period comparison, obligations with controls.
 *
 * Requirements: 20.3
 */

import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../middleware/error-handler.middleware.js';
import { EarlyWarningType } from '../../types/enums.js';
import type {
  AUDetailResponse,
  ObligationDetail,
  ControlSummary,
  EarlyWarning,
} from '../../types/api-responses.js';

const prisma = new PrismaClient();

/**
 * Get the full AU detail response for a given AU and period.
 */
export async function getAUDetail(auId: number, periodId?: number): Promise<AUDetailResponse> {
  // Resolve period
  let resolvedPeriodId = periodId;
  if (!resolvedPeriodId) {
    const current = await prisma.assessmentPeriod.findFirst({ where: { isCurrent: true } });
    if (!current) throw new NotFoundError('No current assessment period found.');
    resolvedPeriodId = current.id;
  }

  // Fetch AU with theme
  const au = await prisma.assessmentUnit.findUnique({
    where: { id: auId },
    include: { theme: { select: { name: true } } },
  });
  if (!au) throw new NotFoundError(`Assessment Unit ${auId} not found.`);

  // Fetch inherent risk
  const ir = await prisma.inherentRisk.findUnique({
    where: { auId_periodId: { auId, periodId: resolvedPeriodId } },
  });

  // Fetch control environment rating
  const cer = await prisma.controlEnvironmentRating.findUnique({
    where: { auId_periodId: { auId, periodId: resolvedPeriodId } },
  });

  // Fetch residual risk (current and previous period)
  const rr = await prisma.residualRisk.findUnique({
    where: { auId_periodId: { auId, periodId: resolvedPeriodId } },
  });

  const previousPeriod = await prisma.assessmentPeriod.findFirst({
    where: { id: { lt: resolvedPeriodId } },
    orderBy: { id: 'desc' },
  });
  const prevRR = previousPeriod
    ? await prisma.residualRisk.findUnique({
        where: { auId_periodId: { auId, periodId: previousPeriod.id } },
      })
    : null;

  const changePct =
    prevRR && prevRR.residualRiskScore > 0 && rr
      ? ((rr.residualRiskScore - prevRR.residualRiskScore) / prevRR.residualRiskScore) * 100
      : null;

  // Fetch CQI distribution (control quality categories for this AU's controls)
  const obligations = await prisma.complianceObligation.findMany({
    where: { auId, isActive: true },
    include: {
      controls: {
        where: { isActive: true },
        include: {
          qualityAssessments: { where: { periodId: resolvedPeriodId } },
          performanceAssessments: { where: { periodId: resolvedPeriodId } },
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
      const cqa = ctrl.qualityAssessments[0];
      if (cqa) {
        cqiDistribution[cqa.controlCategory] = (cqiDistribution[cqa.controlCategory] ?? 0) + 1;
      }
      const cpa = ctrl.performanceAssessments[0];
      if (cpa) {
        cpiDistribution[cpa.performanceCategory] =
          (cpiDistribution[cpa.performanceCategory] ?? 0) + 1;
      }
    }
  }

  // Build obligations detail
  const obligationDetails: ObligationDetail[] = obligations.map((ob) => {
    const controls: ControlSummary[] = ob.controls.map((ctrl) => ({
      id: ctrl.id,
      name: ctrl.name,
      controlType: ctrl.controlType,
      cqaScaledScore: ctrl.qualityAssessments[0]?.cqaScaledScore ?? 0,
      cpaScaledScore: ctrl.performanceAssessments[0]?.cpaScaledScore ?? 0,
      residualRiskRating: '', // Populated below if available
    }));
    return {
      id: ob.id,
      code: ob.code,
      description: ob.description,
      frequency: ob.frequency ?? '',
      criticality: ob.criticality ?? '',
      controlCount: ob.controls.length,
      controls,
    };
  });

  // Build early warnings for this AU
  const earlyWarnings: EarlyWarning[] = [];
  if (previousPeriod && rr && prevRR) {
    if (
      prevRR.aggregateResidual != null &&
      rr.aggregateResidual != null &&
      prevRR.aggregateResidual > 0
    ) {
      const rrChange =
        ((rr.aggregateResidual - prevRR.aggregateResidual) / prevRR.aggregateResidual) * 100;
      if (rrChange > 10) {
        earlyWarnings.push({
          type: EarlyWarningType.DeterioratingRisk,
          message: `Residual risk increased by ${rrChange.toFixed(1)}% vs previous period.`,
          severity: rrChange > 25 ? 'Red' : 'Amber',
        });
      }
    }
  }

  // Check CPI decrease (approaching failure)
  if (previousPeriod && cer) {
    const prevCER = await prisma.controlEnvironmentRating.findUnique({
      where: { auId_periodId: { auId, periodId: previousPeriod.id } },
    });
    if (prevCER && cer.cpiScore < prevCER.cpiScore) {
      earlyWarnings.push({
        type: EarlyWarningType.ApproachingFailure,
        message: `Control performance (CPI) decreased from ${prevCER.cpiScore.toFixed(1)}% to ${cer.cpiScore.toFixed(1)}%.`,
        severity: prevCER.cpiScore - cer.cpiScore > 15 ? 'Red' : 'Amber',
      });
    }
  }

  // Interpret CQI/CPI scores to ratings
  function interpretIndex(score: number): string {
    if (score >= 80) return 'Effective';
    if (score >= 70) return 'Meets Requirements';
    if (score >= 60) return 'Partially Effective';
    if (score >= 40) return 'Improvement Needed';
    return 'Significant Improvement Needed';
  }

  return {
    auInfo: {
      id: au.id,
      code: au.code,
      name: au.name,
      businessArea: au.businessArea,
      themeName: au.theme.name,
      ownerName: au.ownerName ?? '',
    },
    inherentRisk: {
      likelihoodScore: ir?.likelihoodScore ?? 0,
      likelihoodRating: ir?.likelihoodRating ?? '',
      likelihoodParameters: {
        volumeGrowth: { value: ir?.volumeGrowthScore ?? 0, score: ir?.volumeGrowthScore ?? 0 },
        complexity: { value: ir?.complexityScore ?? 0, score: ir?.complexityScore ?? 0 },
        regulatoryReturns: {
          value: ir?.regulatoryReturnsScore ?? 0,
          score: ir?.regulatoryReturnsScore ?? 0,
        },
        complianceBreaches: {
          value: ir?.complianceBreachesScore ?? 0,
          score: ir?.complianceBreachesScore ?? 0,
        },
        controlFailures: {
          value: ir?.controlFailuresScore ?? 0,
          score: ir?.controlFailuresScore ?? 0,
        },
        customerComplaints: {
          value: ir?.customerComplaintsScore ?? 0,
          score: ir?.customerComplaintsScore ?? 0,
        },
      },
      impactScore: ir?.impactScore ?? 0,
      impactRating: ir?.impactRating ?? '',
      impactParameters: {
        businessImpact: {
          value: String(ir?.businessImpactScore ?? 0),
          score: ir?.businessImpactScore ?? 0,
        },
        reputationalImpact: {
          value: String(ir?.reputationalImpactScore ?? 0),
          score: ir?.reputationalImpactScore ?? 0,
        },
        financialPenalty: {
          value: String(ir?.financialPenaltyScore ?? 0),
          score: ir?.financialPenaltyScore ?? 0,
        },
        glImpact: { value: String(ir?.glImpactScore ?? 0), score: ir?.glImpactScore ?? 0 },
      },
      inherentRiskScore: ir?.inherentRiskScore ?? 0,
      inherentRiskRating: ir?.inherentRiskRating ?? '',
    },
    controlEnvironment: {
      cqiScore: cer?.cqiScore ?? 0,
      cqiInterpScore: cer?.cqiInterpScore ?? 0,
      cqiRating: cer ? interpretIndex(cer.cqiScore) : '',
      cqiDistribution,
      cpiScore: cer?.cpiScore ?? 0,
      cpiInterpScore: cer?.cpiInterpScore ?? 0,
      cpiRating: cer ? interpretIndex(cer.cpiScore) : '',
      cpiDistribution,
      cerScore: cer?.cerScore ?? 0,
      cerRating: cer?.cerRating ?? '',
    },
    residualRisk: {
      residualRiskScore: rr?.residualRiskScore ?? 0,
      residualRiskRating: rr?.residualRiskRating ?? '',
      aggregateResidual: rr?.aggregateResidual ?? 0,
      aggregateRating: rr?.aggregateRating ?? '',
      previousPeriodScore: prevRR?.residualRiskScore ?? null,
      changePct: changePct != null ? Math.round(changePct * 100) / 100 : null,
    },
    obligations: obligationDetails,
    earlyWarnings,
  };
}
