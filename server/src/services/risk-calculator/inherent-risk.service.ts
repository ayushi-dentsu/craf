/**
 * Inherent Risk calculation service for CRAF risk assessment.
 *
 * Inherent Risk = scaled likelihood score × impact score
 *
 * Rating thresholds:
 *   ≥375 → Extremely High
 *   ≥200 & <375 → Very High
 *   ≥100 & <200 → High
 *   ≥25 & <100 → Minor
 *   <25 → Insignificant
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */

import { InherentRiskRating } from '../../types/enums.js';

/**
 * Input for inherent risk calculation.
 * Takes the outputs from likelihood and impact calculations.
 */
export interface InherentRiskInput {
  /** Scaled likelihood score (5, 10, 15, 20, or 25) */
  likelihoodScore: number;
  /** Overall impact score (max of 4 impact parameters) */
  impactScore: number;
}

/**
 * Result of the inherent risk calculation.
 */
export interface InherentRiskResult {
  likelihoodScore: number;
  impactScore: number;
  inherentRiskScore: number;
  rating: InherentRiskRating;
}

/**
 * Maps an inherent risk score to a rating.
 * Req 6.2: ≥375 → Extremely High
 * Req 6.3: ≥200 & <375 → Very High
 * Req 6.4: ≥100 & <200 → High
 * Req 6.5: ≥25 & <100 → Minor
 * Req 6.6: <25 → Insignificant
 */
export function mapInherentRiskRating(score: number): InherentRiskRating {
  if (score >= 375) return InherentRiskRating.ExtremelyHigh;
  if (score >= 200) return InherentRiskRating.VeryHigh;
  if (score >= 100) return InherentRiskRating.High;
  if (score >= 25) return InherentRiskRating.Minor;
  return InherentRiskRating.Insignificant;
}

/**
 * Calculates the inherent risk score and rating.
 * Req 6.1: IR = scaled likelihood score × impact score
 */
export function calculateInherentRisk(input: InherentRiskInput): InherentRiskResult {
  const inherentRiskScore = input.likelihoodScore * input.impactScore;
  const rating = mapInherentRiskRating(inherentRiskScore);

  return {
    likelihoodScore: input.likelihoodScore,
    impactScore: input.impactScore,
    inherentRiskScore,
    rating,
  };
}
