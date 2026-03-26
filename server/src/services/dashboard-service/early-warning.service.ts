/**
 * Early Warning Service
 *
 * Detects deteriorating risk trends, approaching failure thresholds,
 * and breach trends across AUs. Assigns traffic light indicators.
 *
 * Requirements: 22.1, 22.2, 22.3, 22.4
 */

import { PrismaClient } from '@prisma/client';
import { EarlyWarningType } from '../../types/enums.js';

const prisma = new PrismaClient();

type Severity = 'Red' | 'Yellow' | 'Green';

export interface EarlyWarningItem {
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
 * Generate all early warnings for a set of AUs in a given period.
 * Req 22.1: Deteriorating risk trend (>10% increase)
 * Req 22.2: Approaching failure (CPA decreasing across periods)
 * Req 22.3: Breach trend (increasing compliance breaches)
 * Req 22.4: Traffic light indicators (Red/Yellow/Green)
 */
export async function generateEarlyWarnings(
  auIds: number[],
  periodId: number,
): Promise<EarlyWarningItem[]> {
  const warnings: EarlyWarningItem[] = [];

  // Find previous period
  const previousPeriod = await prisma.assessmentPeriod.findFirst({
    where: { id: { lt: periodId } },
    orderBy: { id: 'desc' },
  });
  if (!previousPeriod) return warnings;

  const previousPeriodId = previousPeriod.id;

  // Fetch AU info
  const aus = await prisma.assessmentUnit.findMany({
    where: { id: { in: auIds } },
    select: { id: true, name: true, code: true },
  });
  const auMap = new Map(aus.map((a) => [a.id, a]));

  // --- Check 1: Deteriorating risk trend (Req 22.1) ---
  const [currentRRs, previousRRs] = await Promise.all([
    prisma.residualRisk.findMany({ where: { auId: { in: auIds }, periodId } }),
    prisma.residualRisk.findMany({ where: { auId: { in: auIds }, periodId: previousPeriodId } }),
  ]);
  const prevRRMap = new Map(previousRRs.map((r) => [r.auId, r]));

  for (const current of currentRRs) {
    const previous = prevRRMap.get(current.auId);
    if (
      previous &&
      previous.aggregateResidual != null &&
      current.aggregateResidual != null &&
      previous.aggregateResidual > 0
    ) {
      const changePct =
        ((current.aggregateResidual - previous.aggregateResidual) / previous.aggregateResidual) *
        100;
      if (changePct > 10) {
        const au = auMap.get(current.auId);
        warnings.push({
          auId: current.auId,
          auName: au?.name ?? '',
          auCode: au?.code ?? '',
          type: EarlyWarningType.DeterioratingRisk,
          severity: changePct > 25 ? 'Red' : 'Yellow',
          message: `Aggregate residual risk increased by ${changePct.toFixed(1)}% vs previous period.`,
          currentValue: current.aggregateResidual,
          previousValue: previous.aggregateResidual,
          changePercent: Math.round(changePct * 100) / 100,
        });
      }
    }
  }

  // --- Check 2: Approaching failure (Req 22.2) ---
  // Flag controls where CPA decreased across consecutive periods
  const [currentCERs, previousCERs] = await Promise.all([
    prisma.controlEnvironmentRating.findMany({ where: { auId: { in: auIds }, periodId } }),
    prisma.controlEnvironmentRating.findMany({
      where: { auId: { in: auIds }, periodId: previousPeriodId },
    }),
  ]);
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
        severity: decrease > 15 ? 'Red' : 'Yellow',
        message: `Control performance (CPI) decreased from ${previous.cpiScore.toFixed(1)}% to ${current.cpiScore.toFixed(1)}%.`,
        currentValue: current.cpiScore,
        previousValue: previous.cpiScore,
        changePercent:
          previous.cpiScore > 0
            ? Math.round(((current.cpiScore - previous.cpiScore) / previous.cpiScore) * 100 * 100) / 100
            : null,
      });
    }
  }

  // --- Check 3: Breach trend (Req 22.3) ---
  const [currentIRs, previousIRs] = await Promise.all([
    prisma.inherentRisk.findMany({ where: { auId: { in: auIds }, periodId } }),
    prisma.inherentRisk.findMany({ where: { auId: { in: auIds }, periodId: previousPeriodId } }),
  ]);
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
        severity: current.complianceBreachesScore >= 25 ? 'Red' : 'Yellow',
        message: `Compliance breaches score increased from ${previous.complianceBreachesScore} to ${current.complianceBreachesScore}.`,
        currentValue: current.complianceBreachesScore,
        previousValue: previous.complianceBreachesScore,
        changePercent:
          previous.complianceBreachesScore > 0
            ? Math.round(
                ((current.complianceBreachesScore - previous.complianceBreachesScore) /
                  previous.complianceBreachesScore) *
                  100 *
                  100,
              ) / 100
            : null,
      });
    }
  }

  return warnings;
}

/**
 * Get all early warnings for all active AUs.
 */
export async function getAllEarlyWarnings(periodId?: number) {
  let resolvedPeriodId = periodId;
  if (!resolvedPeriodId) {
    const current = await prisma.assessmentPeriod.findFirst({ where: { isCurrent: true } });
    if (!current) throw new Error('No current assessment period found.');
    resolvedPeriodId = current.id;
  }

  const aus = await prisma.assessmentUnit.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  const warnings = await generateEarlyWarnings(
    aus.map((a) => a.id),
    resolvedPeriodId,
  );

  return { periodId: resolvedPeriodId, totalWarnings: warnings.length, warnings };
}

/**
 * Get early warnings for a specific AU.
 */
export async function getAUEarlyWarnings(auId: number, periodId?: number) {
  let resolvedPeriodId = periodId;
  if (!resolvedPeriodId) {
    const current = await prisma.assessmentPeriod.findFirst({ where: { isCurrent: true } });
    if (!current) throw new Error('No current assessment period found.');
    resolvedPeriodId = current.id;
  }

  const warnings = await generateEarlyWarnings([auId], resolvedPeriodId);
  return { auId, periodId: resolvedPeriodId, totalWarnings: warnings.length, warnings };
}
