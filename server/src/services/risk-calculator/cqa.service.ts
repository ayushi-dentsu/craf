/**
 * Control Quality Assessment (CQA) service for CRAF risk assessment.
 *
 * Evaluates control design effectiveness across 4 parameters:
 *   1. Monitoring mechanism (1, 3, or 5)
 *   2. Automation level (1, 3, or 5)
 *   3. Preventive/detective nature (1, 3, or 5)
 *   4. Documentation status (1 or 5)
 *
 * CQA raw = monitoring × automation × type × documentation
 * Scaling: <9→5, ≥9&<81→10, ≥81&<225→15, ≥225&<500→20, ≥500→25
 *
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8
 */

import { CQACategory } from '../../types/enums.js';

/**
 * Input for CQA calculation for a single control.
 */
export interface CQAInput {
  /** Monitoring mechanism score: 1, 3, or 5 (Req 10.2) */
  monitoringScore: number;
  /** Automation level score: 1, 3, or 5 (Req 10.3) */
  automationScore: number;
  /** Preventive/detective type score: 1, 3, or 5 (Req 10.4) */
  typeScore: number;
  /** Documentation status score: 1 or 5 (Req 10.5) */
  documentationScore: number;
}

/**
 * Result of CQA calculation for a single control.
 */
export interface CQAResult {
  monitoringScore: number;
  automationScore: number;
  typeScore: number;
  documentationScore: number;
  rawScore: number;
  scaledScore: number;
  category: CQACategory;
}

/**
 * Computes the CQA raw score.
 * Req 10.6: CQA raw = monitoring × automation × type × documentation
 */
export function calculateCQARawScore(input: CQAInput): number {
  return input.monitoringScore * input.automationScore * input.typeScore * input.documentationScore;
}

/**
 * Scales a CQA raw score to a standard band.
 * Req 10.7:
 *   <9 → 5
 *   ≥9 & <81 → 10
 *   ≥81 & <225 → 15
 *   ≥225 & <500 → 20
 *   ≥500 → 25
 */
export function scaleCQA(rawScore: number): number {
  if (rawScore < 9) return 5;
  if (rawScore < 81) return 10;
  if (rawScore < 225) return 15;
  if (rawScore < 500) return 20;
  return 25;
}

/**
 * Maps a scaled CQA score to a category.
 * Req 10.8:
 *   5 → Significant Improvement Needed
 *   10 → Improvement Needed
 *   15 → Meets Requirement
 *   20 → Effective Control
 *   25 → Significantly Effective Control
 */
export function mapCQACategory(scaledScore: number): CQACategory {
  switch (scaledScore) {
    case 5:
      return CQACategory.SignificantImprovementNeeded;
    case 10:
      return CQACategory.ImprovementNeeded;
    case 15:
      return CQACategory.MeetsRequirement;
    case 20:
      return CQACategory.EffectiveControl;
    case 25:
      return CQACategory.SignificantlyEffectiveControl;
    default:
      return CQACategory.SignificantImprovementNeeded;
  }
}

/**
 * Calculates the full CQA result for a single control.
 * Req 10.1-10.8
 */
export function calculateCQA(input: CQAInput): CQAResult {
  const rawScore = calculateCQARawScore(input);
  const scaledScore = scaleCQA(rawScore);
  const category = mapCQACategory(scaledScore);

  return {
    monitoringScore: input.monitoringScore,
    automationScore: input.automationScore,
    typeScore: input.typeScore,
    documentationScore: input.documentationScore,
    rawScore,
    scaledScore,
    category,
  };
}
