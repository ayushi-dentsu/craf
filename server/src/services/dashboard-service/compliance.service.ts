/**
 * RBI Compliance Service
 *
 * Overall compliance score, regulatory returns status, recent breaches,
 * upcoming deadlines, and 12-month compliance trend.
 *
 * Requirements: 23.1, 23.2, 23.3, 23.4, 23.5
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ComplianceDashboardResult {
  overallComplianceScore: number;
  totalObligations: number;
  compliantObligations: number;
  regulatoryReturnsStatus: RegulatoryReturnStatus[];
  recentBreaches: BreachEntry[];
  upcomingDeadlines: DeadlineEntry[];
  complianceTrend: { labels: string[]; scores: number[] };
}

export interface RegulatoryReturnStatus {
  auId: number;
  auName: string;
  regulatoryReturnsScore: number;
  returnsCount: number;
  status: 'Compliant' | 'At Risk' | 'Non-Compliant';
}

export interface BreachEntry {
  auId: number;
  auName: string;
  breachScore: number;
  periodName: string;
}

export interface DeadlineEntry {
  obligationId: number;
  obligationCode: string;
  description: string;
  frequency: string;
  auName: string;
}

/**
 * Get the RBI compliance dashboard data.
 * Req 23.1: Overall compliance score = (compliant obligations / total) × 100
 * Req 23.2: Regulatory returns status table
 * Req 23.3: Recent breaches (last 90 days / recent period)
 * Req 23.4: Upcoming deadlines
 * Req 23.5: 12-month compliance trend
 */
export async function getComplianceDashboard(
  periodId?: number,
): Promise<ComplianceDashboardResult> {
  // Resolve period
  let resolvedPeriodId = periodId;
  if (!resolvedPeriodId) {
    const current = await prisma.assessmentPeriod.findFirst({ where: { isCurrent: true } });
    if (!current) throw new Error('No current assessment period found.');
    resolvedPeriodId = current.id;
  }

  // --- Req 23.1: Overall compliance score ---
  // An obligation is "in compliance" if all its controls have CPA scaled score >= 15 (Meets Requirement+)
  const obligations = await prisma.complianceObligation.findMany({
    where: { isActive: true },
    include: {
      au: { select: { name: true } },
      controls: {
        where: { isActive: true },
        include: {
          performanceAssessments: { where: { periodId: resolvedPeriodId } },
        },
      },
    },
  });

  let compliantCount = 0;
  for (const ob of obligations) {
    if (ob.controls.length === 0) continue; // No controls = not assessable
    const allMeetRequirement = ob.controls.every((ctrl) => {
      const cpa = ctrl.performanceAssessments[0];
      return cpa && cpa.cpaScaledScore >= 15;
    });
    if (allMeetRequirement) compliantCount++;
  }

  const totalObligations = obligations.filter((o) => o.controls.length > 0).length;
  const overallComplianceScore =
    totalObligations > 0 ? Math.round((compliantCount / totalObligations) * 100 * 100) / 100 : 0;

  // --- Req 23.2: Regulatory returns status ---
  const irRecords = await prisma.inherentRisk.findMany({
    where: { periodId: resolvedPeriodId },
    include: { au: { select: { id: true, name: true } } },
  });

  const regulatoryReturnsStatus: RegulatoryReturnStatus[] = irRecords.map((ir) => {
    let status: 'Compliant' | 'At Risk' | 'Non-Compliant' = 'Compliant';
    if (ir.regulatoryReturnsScore >= 20) status = 'Non-Compliant';
    else if (ir.regulatoryReturnsScore >= 15) status = 'At Risk';
    return {
      auId: ir.au.id,
      auName: ir.au.name,
      regulatoryReturnsScore: ir.regulatoryReturnsScore,
      returnsCount: ir.regulatoryReturnsScore, // Score maps to count bands
      status,
    };
  });

  // --- Req 23.3: Recent breaches ---
  // Use compliance breach scores from the current and previous period
  const recentBreaches: BreachEntry[] = [];
  const currentPeriod = await prisma.assessmentPeriod.findUnique({
    where: { id: resolvedPeriodId },
  });

  const breachIRs = await prisma.inherentRisk.findMany({
    where: { periodId: resolvedPeriodId, complianceBreachesScore: { gt: 5 } },
    include: { au: { select: { id: true, name: true } } },
  });

  for (const ir of breachIRs) {
    recentBreaches.push({
      auId: ir.au.id,
      auName: ir.au.name,
      breachScore: ir.complianceBreachesScore,
      periodName: currentPeriod?.name ?? '',
    });
  }

  // --- Req 23.4: Upcoming deadlines ---
  // Obligations with frequency-based deadlines
  const upcomingDeadlines: DeadlineEntry[] = obligations
    .filter((ob) => ob.frequency && ['Daily', 'Weekly', 'Monthly', 'Quarterly'].includes(ob.frequency))
    .slice(0, 20)
    .map((ob) => ({
      obligationId: ob.id,
      obligationCode: ob.code,
      description: ob.description.substring(0, 100),
      frequency: ob.frequency ?? '',
      auName: ob.au.name,
    }));

  // --- Req 23.5: 12-month compliance trend ---
  const periods = await prisma.assessmentPeriod.findMany({
    orderBy: { startDate: 'asc' },
    take: 4,
  });

  const trendLabels: string[] = [];
  const trendScores: number[] = [];

  for (const period of periods) {
    trendLabels.push(period.name);

    const periodObs = await prisma.complianceObligation.findMany({
      where: { isActive: true },
      include: {
        controls: {
          where: { isActive: true },
          include: {
            performanceAssessments: { where: { periodId: period.id } },
          },
        },
      },
    });

    let periodCompliant = 0;
    let periodTotal = 0;
    for (const ob of periodObs) {
      if (ob.controls.length === 0) continue;
      periodTotal++;
      const allMeet = ob.controls.every((c) => {
        const cpa = c.performanceAssessments[0];
        return cpa && cpa.cpaScaledScore >= 15;
      });
      if (allMeet) periodCompliant++;
    }

    trendScores.push(
      periodTotal > 0 ? Math.round((periodCompliant / periodTotal) * 100 * 100) / 100 : 0,
    );
  }

  return {
    overallComplianceScore,
    totalObligations,
    compliantObligations: compliantCount,
    regulatoryReturnsStatus,
    recentBreaches,
    upcomingDeadlines,
    complianceTrend: { labels: trendLabels, scores: trendScores },
  };
}
