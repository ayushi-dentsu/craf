/**
 * Control Environment Rating (CER) service for CRAF risk assessment.
 *
 * CER = CQI interpretation score × CPI interpretation score
 *
 * Rating thresholds:
 *   <15 → Significant Improvement Needed
 *   ≥15 & <30 → Improvement Needed
 *   ≥30 & <60 → Partially Effective
 *   ≥60 & <125 → Meets Requirement
 *   ≥125 → Effective
 *
 * Requirements: 15.1, 15.2
 */

import { CERRating } from '../../types/enums.js';

/**
 * Input for CER calculation.
 */
export interface CERInput {
  /** CQI interpretation score (1, 4, 9, 16, or 25) */
  cqiInterpScore: number;
  /** CPI interpretation score (1, 4, 9, 16, or 25) */
  cpiInterpScore: number;
}

/**
 * Result of CER calculation.
 */
export interface CERResult {
  cqiInterpScore: number;
  cpiInterpScore: number;
  cerScore: number;
  rating: CERRating;
}

/**
 * Maps a CER score to a rating.
 * Req 15.2:
 *   <15 → Significant Improvement Needed
 *   ≥15 & <30 → Improvement Needed
 *   ≥30 & <60 → Partially Effective
 *   ≥60 & <125 → Meets Requirement
 *   ≥125 → Effective
 */
export function mapCERRating(cerScore: number): CERRating {
  if (cerScore >= 125) return CERRating.Effective;
  if (cerScore >= 60) return CERRating.MeetsRequirement;
  if (cerScore >= 30) return CERRating.PartiallyEffective;
  if (cerScore >= 15) return CERRating.ImprovementNeeded;
  return CERRating.SignificantImprovementNeeded;
}

/**
 * Calculates the Control Environment Rating.
 * Req 15.1: CER = CQI interp score × CPI interp score
 */
export function calculateCER(input: CERInput): CERResult {
  const cerScore = input.cqiInterpScore * input.cpiInterpScore;
  const rating = mapCERRating(cerScore);

  return {
    cqiInterpScore: input.cqiInterpScore,
    cpiInterpScore: input.cpiInterpScore,
    cerScore,
    rating,
  };
}
