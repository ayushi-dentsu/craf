/**
 * Residual Risk calculation service for CRAF risk assessment.
 *
 * Per-control: RR = IR ÷ CER (with CER=0 edge case → "No Control")
 * Rating thresholds:
 *   ≥6.67 → Significant Improvement Needed
 *   <6.67 & >2 → Improvement Needed
 *   ≤2 & >1 → Meets Requirement
 *   ≤1 → Well Controlled
 *
 * Aggregation: weighted sum of category counts ÷ total controls
 * Aggregate rating:
 *   ≥70% → Extremely High
 *   ≥45% → High
 *   >5% → Medium
 *   >1% → Low
 *   ≤1% → Negligible
 *
 * Requirements: 16.1-16.6, 17.1-17.3, 32.1
 */

import { ResidualRiskRating, AggregateResidualRiskRating } from '../../types/enums.js';

/**
 * Input for per-control residual risk calculation.
 */
export interface ResidualRiskInput {
  /** Inherent risk score (likelihood × impact) */
  inherentRiskScore: number;
  /** Control Environment Rating score (CQI interp × CPI interp) */
  cerScore: number;
}

/**
 * Result of per-control residual risk calculation.
 */
export interface ResidualRiskResult {
  inherentRiskScore: number;
  cerScore: number;
  residualRiskScore: number;
  rating: ResidualRiskRating;
}

/**
 * Input for residual risk aggregation.
 */
export interface AggregationInput {
  ratings: ResidualRiskRating[];
}

/**
 * Result of residual risk aggregation.
 */
export interface AggregationResult {
  /** Weighted aggregate percentage (0-1 range) */
  aggregateResidual: number;
  /** Aggregate rating */
  aggregateRating: AggregateResidualRiskRating;
  /** Breakdown of control counts per rating */
  ratingBreakdown: Record<ResidualRiskRating, number>;
}

/**
 * Maps a residual risk score to a rating.
 * Req 16.2: No control → handled by caller (CER=0)
 * Req 16.3: ≥6.67 → Significant Improvement Needed
 * Req 16.4: <6.67 & >2 → Improvement Needed
 * Req 16.5: ≤2 & >1 → Meets Requirement
 * Req 16.6: ≤1 → Well Controlled
 */
export function mapResidualRiskRating(score: number): ResidualRiskRating {
  if (score >= 6.67) return ResidualRiskRating.SignificantImprovementNeeded;
  if (score > 2) return ResidualRiskRating.ImprovementNeeded;
  if (score > 1) return ResidualRiskRating.MeetsRequirement;
  return ResidualRiskRating.WellControlled;
}

/**
 * Calculates residual risk for a single control.
 * Req 16.1: RR = IR ÷ CER
 * Req 16.2: CER=0 → No Control rating (no division)
 */
export function calculateResidualRisk(input: ResidualRiskInput): ResidualRiskResult {
  // Edge case: CER = 0 means no control exists
  if (input.cerScore === 0) {
    return {
      inherentRiskScore: input.inherentRiskScore,
      cerScore: input.cerScore,
      residualRiskScore: 0,
      rating: ResidualRiskRating.NoControl,
    };
  }

  const residualRiskScore = input.inherentRiskScore / input.cerScore;
  const rating = mapResidualRiskRating(residualRiskScore);

  return {
    inherentRiskScore: input.inherentRiskScore,
    cerScore: input.cerScore,
    residualRiskScore,
    rating,
  };
}

/**
 * Aggregation weights per residual risk rating.
 * Req 17.1:
 *   No Control: 100%
 *   Significant Improvement Needed: 80%
 *   Improvement Needed: 60%
 *   Meets Requirement: 25%
 *   Well Controlled: 1%
 */
const AGGREGATION_WEIGHTS: Record<ResidualRiskRating, number> = {
  [ResidualRiskRating.NoControl]: 1.0,
  [ResidualRiskRating.SignificantImprovementNeeded]: 0.8,
  [ResidualRiskRating.ImprovementNeeded]: 0.6,
  [ResidualRiskRating.MeetsRequirement]: 0.25,
  [ResidualRiskRating.WellControlled]: 0.01,
};

/**
 * Maps an aggregate residual risk percentage to a rating.
 * Req 17.3:
 *   ≥70% → Extremely High
 *   ≥45% & <70% → High
 *   >5% & <45% → Medium
 *   >1% & ≤5% → Low
 *   ≤1% → Negligible
 */
export function mapAggregateRating(aggregatePercent: number): AggregateResidualRiskRating {
  if (aggregatePercent >= 0.7) return AggregateResidualRiskRating.ExtremelyHigh;
  if (aggregatePercent >= 0.45) return AggregateResidualRiskRating.High;
  if (aggregatePercent > 0.05) return AggregateResidualRiskRating.Medium;
  if (aggregatePercent > 0.01) return AggregateResidualRiskRating.Low;
  return AggregateResidualRiskRating.Negligible;
}

/**
 * Aggregates residual risk from control-level ratings.
 * Req 17.2: count controls per category, multiply by weight, sum, divide by total.
 */
export function aggregateResidualRisk(input: AggregationInput): AggregationResult {
  const { ratings } = input;

  if (ratings.length === 0) {
    return {
      aggregateResidual: 0,
      aggregateRating: AggregateResidualRiskRating.Negligible,
      ratingBreakdown: {
        [ResidualRiskRating.NoControl]: 0,
        [ResidualRiskRating.SignificantImprovementNeeded]: 0,
        [ResidualRiskRating.ImprovementNeeded]: 0,
        [ResidualRiskRating.MeetsRequirement]: 0,
        [ResidualRiskRating.WellControlled]: 0,
      },
    };
  }

  const breakdown: Record<ResidualRiskRating, number> = {
    [ResidualRiskRating.NoControl]: 0,
    [ResidualRiskRating.SignificantImprovementNeeded]: 0,
    [ResidualRiskRating.ImprovementNeeded]: 0,
    [ResidualRiskRating.MeetsRequirement]: 0,
    [ResidualRiskRating.WellControlled]: 0,
  };

  for (const rating of ratings) {
    breakdown[rating]++;
  }

  let weightedSum = 0;
  for (const [rating, count] of Object.entries(breakdown)) {
    weightedSum += count * AGGREGATION_WEIGHTS[rating as ResidualRiskRating];
  }

  const aggregateResidual = weightedSum / ratings.length;
  const aggregateRating = mapAggregateRating(aggregateResidual);

  return {
    aggregateResidual,
    aggregateRating,
    ratingBreakdown: breakdown,
  };
}
