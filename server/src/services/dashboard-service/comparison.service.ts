/**
 * Comparison Service
 *
 * Year-over-year: side-by-side metrics with delta percentages, color-coded deterioration/improvement.
 * Before/after: split-screen data for control changes showing CQI/CPI/CER/RR impact.
 *
 * Requirements: 21.1, 21.2, 21.3
 */

import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../middleware/error-handler.middleware.js';

const prisma = new PrismaClient();

/**
 * Compute delta percentage: ((current - previous) / previous) * 100
 */
function computeDelta(
  current: number | null | undefined,
  previous: number | null | undefined,
): number | null {
  if (previous == null || previous === 0 || current == null) return null;
  return Math.round(((current - previous) / previous) * 100 * 100) / 100;
}

/**
 * Determine color code for a delta: red for deterioration, green for improvement.
 * For risk scores, increase = deterioration. For effectiveness, increase = improvement.
 */
function deltaColor(delta: number | null, higherIsBetter: boolean): string | null {
  if (delta == null) return null;
  if (higherIsBetter) return delta >= 0 ? 'green' : 'red';
  return delta <= 0 ? 'green' : 'red';
}

export interface PeriodMetrics {
  inherentRiskScore: number | null;
  inherentRiskRating: string | null;
  likelihoodScore: number | null;
  impactScore: number | null;
  cqiScore: number | null;
  cpiScore: number | null;
  cerScore: number | null;
  cerRating: string | null;
  residualRiskScore: number | null;
  residualRiskRating: string | null;
  aggregateResidual: number | null;
  aggregateRating: string | null;
}

export interface YearOverYearResult {
  auId: number;
  auName: string;
  currentPeriod: { id: number; name: string };
  previousPeriod: { id: number; name: string };
  current: PeriodMetrics;
  previous: PeriodMetrics;
  deltas: {
    inherentRisk: { delta: number | null; color: string | null };
    cer: { delta: number | null; color: string | null };
    residualRisk: { delta: number | null; color: string | null };
    aggregateResidual: { delta: number | null; color: string | null };
  };
}

/**
 * Fetch all metrics for an AU in a given period.
 */
async function fetchPeriodMetrics(auId: number, periodId: number): Promise<PeriodMetrics> {
  const [ir, cer, rr] = await Promise.all([
    prisma.inherentRisk.findUnique({ where: { auId_periodId: { auId, periodId } } }),
    prisma.controlEnvironmentRating.findUnique({ where: { auId_periodId: { auId, periodId } } }),
    prisma.residualRisk.findUnique({ where: { auId_periodId: { auId, periodId } } }),
  ]);

  return {
    inherentRiskScore: ir?.inherentRiskScore ?? null,
    inherentRiskRating: ir?.inherentRiskRating ?? null,
    likelihoodScore: ir?.likelihoodScore ?? null,
    impactScore: ir?.impactScore ?? null,
    cqiScore: cer?.cqiScore ?? null,
    cpiScore: cer?.cpiScore ?? null,
    cerScore: cer?.cerScore ?? null,
    cerRating: cer?.cerRating ?? null,
    residualRiskScore: rr?.residualRiskScore ?? null,
    residualRiskRating: rr?.residualRiskRating ?? null,
    aggregateResidual: rr?.aggregateResidual ?? null,
    aggregateRating: rr?.aggregateRating ?? null,
  };
}

/**
 * Year-over-year comparison for an AU.
 * Req 21.1, 21.2: Side-by-side metrics with delta percentages, color-coded.
 */
export async function getYearOverYear(
  auId: number,
  currentPeriodId?: number,
  previousPeriodId?: number,
): Promise<YearOverYearResult> {
  const au = await prisma.assessmentUnit.findUnique({
    where: { id: auId },
    select: { id: true, name: true },
  });
  if (!au) throw new NotFoundError(`Assessment Unit ${auId} not found.`);

  // Resolve current period
  if (!currentPeriodId) {
    const current = await prisma.assessmentPeriod.findFirst({ where: { isCurrent: true } });
    if (!current) throw new NotFoundError('No current assessment period found.');
    currentPeriodId = current.id;
  }

  // Resolve previous period
  if (!previousPeriodId) {
    const prev = await prisma.assessmentPeriod.findFirst({
      where: { id: { lt: currentPeriodId } },
      orderBy: { id: 'desc' },
    });
    if (!prev) throw new NotFoundError('No previous assessment period found.');
    previousPeriodId = prev.id;
  }

  const [currentMetrics, previousMetrics] = await Promise.all([
    fetchPeriodMetrics(auId, currentPeriodId),
    fetchPeriodMetrics(auId, previousPeriodId),
  ]);

  const [currentPeriod, previousPeriod] = await Promise.all([
    prisma.assessmentPeriod.findUnique({
      where: { id: currentPeriodId },
      select: { id: true, name: true },
    }),
    prisma.assessmentPeriod.findUnique({
      where: { id: previousPeriodId },
      select: { id: true, name: true },
    }),
  ]);

  const irDelta = computeDelta(currentMetrics.inherentRiskScore, previousMetrics.inherentRiskScore);
  const cerDelta = computeDelta(currentMetrics.cerScore, previousMetrics.cerScore);
  const rrDelta = computeDelta(
    currentMetrics.residualRiskScore,
    previousMetrics.residualRiskScore,
  );
  const aggDelta = computeDelta(
    currentMetrics.aggregateResidual,
    previousMetrics.aggregateResidual,
  );

  return {
    auId,
    auName: au.name,
    currentPeriod: currentPeriod ?? { id: currentPeriodId, name: '' },
    previousPeriod: previousPeriod ?? { id: previousPeriodId, name: '' },
    current: currentMetrics,
    previous: previousMetrics,
    deltas: {
      inherentRisk: { delta: irDelta, color: deltaColor(irDelta, false) },
      cer: { delta: cerDelta, color: deltaColor(cerDelta, true) },
      residualRisk: { delta: rrDelta, color: deltaColor(rrDelta, false) },
      aggregateResidual: { delta: aggDelta, color: deltaColor(aggDelta, false) },
    },
  };
}

export interface BeforeAfterResult {
  auId: number;
  auName: string;
  currentPeriod: { id: number; name: string };
  previousPeriod: { id: number; name: string } | null;
  before: {
    cqiScore: number | null;
    cpiScore: number | null;
    cerScore: number | null;
    cerRating: string | null;
    residualRiskScore: number | null;
    residualRiskRating: string | null;
  };
  after: {
    cqiScore: number | null;
    cpiScore: number | null;
    cerScore: number | null;
    cerRating: string | null;
    residualRiskScore: number | null;
    residualRiskRating: string | null;
  };
  impact: {
    cqiDelta: number | null;
    cpiDelta: number | null;
    cerDelta: number | null;
    residualRiskDelta: number | null;
  };
}

/**
 * Before/after comparison for control changes.
 * Req 21.3: Split-screen data showing CQI/CPI/CER/RR impact.
 */
export async function getBeforeAfter(
  auId: number,
  periodId: number,
): Promise<BeforeAfterResult> {
  const au = await prisma.assessmentUnit.findUnique({
    where: { id: auId },
    select: { id: true, name: true },
  });
  if (!au) throw new NotFoundError(`Assessment Unit ${auId} not found.`);

  const previousPeriod = await prisma.assessmentPeriod.findFirst({
    where: { id: { lt: periodId } },
    orderBy: { id: 'desc' },
  });

  const [currentCER, currentRR] = await Promise.all([
    prisma.controlEnvironmentRating.findUnique({
      where: { auId_periodId: { auId, periodId } },
    }),
    prisma.residualRisk.findUnique({
      where: { auId_periodId: { auId, periodId } },
    }),
  ]);

  const [prevCER, prevRR] = previousPeriod
    ? await Promise.all([
        prisma.controlEnvironmentRating.findUnique({
          where: { auId_periodId: { auId, periodId: previousPeriod.id } },
        }),
        prisma.residualRisk.findUnique({
          where: { auId_periodId: { auId, periodId: previousPeriod.id } },
        }),
      ])
    : [null, null];

  const currentPeriodInfo = await prisma.assessmentPeriod.findUnique({
    where: { id: periodId },
    select: { id: true, name: true },
  });

  return {
    auId,
    auName: au.name,
    currentPeriod: currentPeriodInfo ?? { id: periodId, name: '' },
    previousPeriod: previousPeriod ? { id: previousPeriod.id, name: previousPeriod.name } : null,
    before: {
      cqiScore: prevCER?.cqiScore ?? null,
      cpiScore: prevCER?.cpiScore ?? null,
      cerScore: prevCER?.cerScore ?? null,
      cerRating: prevCER?.cerRating ?? null,
      residualRiskScore: prevRR?.residualRiskScore ?? null,
      residualRiskRating: prevRR?.residualRiskRating ?? null,
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
      cqiDelta: computeDelta(currentCER?.cqiScore, prevCER?.cqiScore),
      cpiDelta: computeDelta(currentCER?.cpiScore, prevCER?.cpiScore),
      cerDelta: computeDelta(currentCER?.cerScore, prevCER?.cerScore),
      residualRiskDelta: computeDelta(currentRR?.residualRiskScore, prevRR?.residualRiskScore),
    },
  };
}
