/**
 * Executive Dashboard Service
 *
 * Aggregates KPIs, heatmap data, trend data, risk distribution by theme,
 * and controls by effectiveness category for the executive dashboard.
 *
 * Requirements: 19.1, 19.2, 19.3, 19.6, 19.7
 */

import { PrismaClient } from '@prisma/client';
import {
  HeatmapColor,
  AggregateResidualRiskRating,
  InherentRiskRating,
  EarlyWarningType,
} from '../../types/enums.js';
import type {
  ExecutiveDashboardResponse,
  HeatmapEntry,
  RiskDistribution,
} from '../../types/api-responses.js';

const prisma = new PrismaClient();

/**
 * Map residual risk aggregate rating to heatmap color.
 * Req 19.2: Red=Extremely High, Orange=Very High, Yellow=High, LightGreen=Minor, Green=Insignificant
 */
export function ratingToColor(rating: string): string {
  switch (rating) {
    case AggregateResidualRiskRating.ExtremelyHigh:
      return HeatmapColor.Red;
    case AggregateResidualRiskRating.High:
      return HeatmapColor.Orange;
    case AggregateResidualRiskRating.Medium:
      return HeatmapColor.Yellow;
    case AggregateResidualRiskRating.Low:
      return HeatmapColor.LightGreen;
    case AggregateResidualRiskRating.Negligible:
      return HeatmapColor.Green;
    default:
      return HeatmapColor.Yellow;
  }
}

export interface DashboardFilters {
  businessArea?: string;
  riskRating?: string;
  themeId?: number;
  periodId?: number;
}

/**
 * Resolve the assessment period to use. Falls back to the current period.
 */
async function resolvePeriodId(periodId?: number): Promise<number> {
  if (periodId) return periodId;
  const current = await prisma.assessmentPeriod.findFirst({ where: { isCurrent: true } });
  if (!current) throw new Error('No current assessment period found.');
  return current.id;
}

/**
 * Get KPI data for the executive dashboard.
 * Req 19.1: Overall Residual Risk Score, High/Critical Risks Count,
 *           Control Effectiveness %, Compliance Breach Trend
 */
export async function getKPIs(periodId: number) {
  // Overall residual risk: average of all AU aggregate residual scores
  const residualRisks = await prisma.residualRisk.findMany({
    where: { periodId },
    select: { aggregateResidual: true, aggregateRating: true },
  });

  const validScores = residualRisks.filter((r) => r.aggregateResidual != null);
  const overallResidualRiskScore =
    validScores.length > 0
      ? validScores.reduce((sum, r) => sum + (r.aggregateResidual ?? 0), 0) / validScores.length
      : 0;

  // High/critical risks count: AUs with Extremely High or High aggregate rating
  const highCriticalRisksCount = residualRisks.filter(
    (r) =>
      r.aggregateRating === AggregateResidualRiskRating.ExtremelyHigh ||
      r.aggregateRating === AggregateResidualRiskRating.High,
  ).length;

  // Control effectiveness: average CER across all AUs for the period
  const cerRecords = await prisma.controlEnvironmentRating.findMany({
    where: { periodId },
    select: { cerScore: true },
  });
  const controlEffectivenessPercent =
    cerRecords.length > 0
      ? cerRecords.reduce((sum, c) => sum + c.cerScore, 0) / cerRecords.length
      : 0;

  // Compliance breach trend: breach scores across recent periods (up to 4 quarters)
  const periods = await prisma.assessmentPeriod.findMany({
    orderBy: { startDate: 'asc' },
    take: 8,
  });
  const breachTrend: number[] = [];
  for (const period of periods) {
    const irRecords = await prisma.inherentRisk.findMany({
      where: { periodId: period.id },
      select: { complianceBreachesScore: true },
    });
    const avgBreach =
      irRecords.length > 0
        ? irRecords.reduce((sum, ir) => sum + ir.complianceBreachesScore, 0) / irRecords.length
        : 0;
    breachTrend.push(Math.round(avgBreach * 100) / 100);
  }

  return {
    overallResidualRiskScore: Math.round(overallResidualRiskScore * 100) / 100,
    highCriticalRisksCount,
    controlEffectivenessPercent: Math.round(controlEffectivenessPercent * 100) / 100,
    complianceBreachTrend: breachTrend,
  };
}

/**
 * Build heatmap data: all AUs with residual risk rating, color mapping, early warning flags.
 * Req 19.2, 19.3: Color-coded cells, hover tooltip, early warning icon overlay
 * Req 19.8: Filter by business area, risk rating, theme
 */
export async function getHeatmapData(
  periodId: number,
  filters?: Omit<DashboardFilters, 'periodId'>,
): Promise<HeatmapEntry[]> {
  // Build AU filter
  const auWhere: Record<string, unknown> = { isActive: true };
  if (filters?.businessArea) auWhere.businessArea = filters.businessArea;
  if (filters?.themeId) auWhere.themeId = filters.themeId;

  const aus = await prisma.assessmentUnit.findMany({
    where: auWhere,
    include: { theme: { select: { name: true } } },
  });

  const auIds = aus.map((a) => a.id);

  // Fetch residual risk for all AUs in this period
  const residualRisks = await prisma.residualRisk.findMany({
    where: { auId: { in: auIds }, periodId },
  });
  const rrMap = new Map(residualRisks.map((r) => [r.auId, r]));

  // Detect early warnings: check if residual risk increased >10% vs previous period
  const previousPeriod = await prisma.assessmentPeriod.findFirst({
    where: { id: { lt: periodId } },
    orderBy: { id: 'desc' },
  });

  const earlyWarningAuIds = new Set<number>();
  if (previousPeriod) {
    const prevRRs = await prisma.residualRisk.findMany({
      where: { auId: { in: auIds }, periodId: previousPeriod.id },
    });
    const prevRRMap = new Map(prevRRs.map((r) => [r.auId, r]));

    for (const current of residualRisks) {
      const prev = prevRRMap.get(current.auId);
      if (
        prev &&
        prev.aggregateResidual != null &&
        current.aggregateResidual != null &&
        prev.aggregateResidual > 0
      ) {
        const changePct =
          ((current.aggregateResidual - prev.aggregateResidual) / prev.aggregateResidual) * 100;
        if (changePct > 10) earlyWarningAuIds.add(current.auId);
      }
    }
  }

  const entries: HeatmapEntry[] = aus.map((au) => {
    const rr = rrMap.get(au.id);
    const rating = rr?.aggregateRating ?? 'Medium';
    const entry: HeatmapEntry = {
      auId: au.id,
      auName: au.name,
      businessArea: au.businessArea,
      themeName: au.theme.name,
      residualRiskScore: rr?.residualRiskScore ?? 0,
      residualRiskRating: rating,
      color: ratingToColor(rating),
      hasEarlyWarning: earlyWarningAuIds.has(au.id),
    };
    return entry;
  });

  // Apply risk rating filter after mapping
  if (filters?.riskRating) {
    return entries.filter((e) => e.residualRiskRating === filters.riskRating);
  }

  return entries;
}

/**
 * Build trend data: quarterly residual risk and control effectiveness over available periods.
 * Req 19.5, 19.6: Trend charts with quarterly data points
 */
export async function getTrendData(periodCount = 8) {
  const periods = await prisma.assessmentPeriod.findMany({
    orderBy: { startDate: 'asc' },
    take: periodCount,
  });

  const labels: string[] = [];
  const residualRiskTrend: number[] = [];
  const controlEffectivenessTrend: number[] = [];

  for (const period of periods) {
    labels.push(period.name);

    const rrs = await prisma.residualRisk.findMany({
      where: { periodId: period.id },
      select: { aggregateResidual: true },
    });
    const validRRs = rrs.filter((r) => r.aggregateResidual != null);
    const avgRR =
      validRRs.length > 0
        ? validRRs.reduce((sum, r) => sum + (r.aggregateResidual ?? 0), 0) / validRRs.length
        : 0;
    residualRiskTrend.push(Math.round(avgRR * 100) / 100);

    const cers = await prisma.controlEnvironmentRating.findMany({
      where: { periodId: period.id },
      select: { cerScore: true },
    });
    const avgCER =
      cers.length > 0 ? cers.reduce((sum, c) => sum + c.cerScore, 0) / cers.length : 0;
    controlEffectivenessTrend.push(Math.round(avgCER * 100) / 100);
  }

  return {
    labels,
    residualRisk: residualRiskTrend,
    controlEffectiveness: controlEffectivenessTrend,
  };
}

/**
 * Build risk distribution by theme.
 * Req 19.6: Risk distribution by theme bar chart
 */
export async function getRiskDistributionByTheme(
  periodId: number,
): Promise<Record<string, RiskDistribution>> {
  const themes = await prisma.theme.findMany({
    include: {
      assessmentUnits: {
        where: { isActive: true },
        select: { id: true },
      },
    },
  });

  const result: Record<string, RiskDistribution> = {};

  for (const theme of themes) {
    const auIds = theme.assessmentUnits.map((au) => au.id);
    if (auIds.length === 0) continue;

    const irRecords = await prisma.inherentRisk.findMany({
      where: { auId: { in: auIds }, periodId },
      select: { inherentRiskRating: true },
    });

    const dist: RiskDistribution = {
      extremelyHigh: 0,
      veryHigh: 0,
      high: 0,
      minor: 0,
      insignificant: 0,
    };

    for (const ir of irRecords) {
      switch (ir.inherentRiskRating) {
        case InherentRiskRating.ExtremelyHigh:
          dist.extremelyHigh++;
          break;
        case InherentRiskRating.VeryHigh:
          dist.veryHigh++;
          break;
        case InherentRiskRating.High:
          dist.high++;
          break;
        case InherentRiskRating.Minor:
          dist.minor++;
          break;
        case InherentRiskRating.Insignificant:
          dist.insignificant++;
          break;
      }
    }

    result[theme.name] = dist;
  }

  return result;
}

/**
 * Build controls by effectiveness category.
 * Req 19.6: Controls by effectiveness donut chart
 */
export async function getControlsByEffectiveness(periodId: number) {
  const cers = await prisma.controlEnvironmentRating.findMany({
    where: { periodId },
    select: { cerRating: true },
  });

  const counts = {
    effective: 0,
    meetsRequirement: 0,
    improvementNeeded: 0,
    significantImprovement: 0,
  };

  for (const cer of cers) {
    switch (cer.cerRating) {
      case 'Effective':
        counts.effective++;
        break;
      case 'Meets Requirement':
        counts.meetsRequirement++;
        break;
      case 'Partially Effective':
      case 'Improvement Needed':
        counts.improvementNeeded++;
        break;
      case 'Significant Improvement Needed':
        counts.significantImprovement++;
        break;
    }
  }

  return counts;
}

/**
 * Get the full executive dashboard response.
 * Req 19.1, 19.2, 19.3, 19.6, 19.7
 */
export async function getExecutiveDashboard(
  filters?: DashboardFilters,
): Promise<ExecutiveDashboardResponse> {
  const periodId = await resolvePeriodId(filters?.periodId);

  const [kpis, heatmap, trends, riskDistributionByTheme, controlsByEffectiveness] =
    await Promise.all([
      getKPIs(periodId),
      getHeatmapData(periodId, filters),
      getTrendData(),
      getRiskDistributionByTheme(periodId),
      getControlsByEffectiveness(periodId),
    ]);

  return {
    kpis,
    heatmap,
    trends,
    riskDistributionByTheme,
    controlsByEffectiveness,
  };
}
