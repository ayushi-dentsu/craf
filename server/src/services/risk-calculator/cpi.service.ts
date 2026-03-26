/**
 * Control Performance Index (CPI) service for CRAF risk assessment.
 *
 * CPI = 100% − weighted average CPA
 *
 * Category weights (based on CPA raw score):
 *   No Control (obligations without control): 100%
 *   Significant Improvement Needed (<5): 80%
 *   Improvement Needed (≥5 & <10): 60%
 *   Meets Requirements (≥10 & <15): 40%
 *   Effective Control (≥15 & <25): 30%
 *   Significantly Effective Control (=25): 20%
 *
 * Interpretation (same as CQI):
 *   <40% → Significant Improvement Needed (score 1)
 *   ≥40% → Improvement Needed (score 4)
 *   ≥60% → Partially Effective (score 9)
 *   ≥70% → Meets Requirements (score 16)
 *   ≥80% → Effective (score 25)
 *
 * Requirements: 14.1, 14.2, 14.3
 */

import { IndexInterpretation } from '../../types/enums.js';

/**
 * A control's CPA raw score for CPI aggregation.
 * Use `null` to represent an obligation with no control.
 */
export interface CPIControlInput {
  /** CPA raw score, or null if no control exists for the obligation */
  cpaRawScore: number | null;
}

/**
 * Result of CPI calculation for an AU.
 */
export interface CPIResult {
  /** Weighted average CPA (0-1 range) */
  weightedAvg: number;
  /** CPI percentage (0-1 range, i.e. 1 - weightedAvg) */
  cpiScore: number;
  /** Interpretation score: 1, 4, 9, 16, or 25 */
  interpScore: number;
  /** Interpretation label */
  interpretation: IndexInterpretation;
  /** Breakdown of control counts per category */
  categoryBreakdown: CPICategoryBreakdown;
}

export interface CPICategoryBreakdown {
  noControl: number;
  significantImprovementNeeded: number;
  improvementNeeded: number;
  meetsRequirements: number;
  effectiveControl: number;
  significantlyEffectiveControl: number;
}

/**
 * Determines the CPA category weight for a given raw score.
 * Req 14.1
 *
 * CPA raw score = KCI/SA score × testing score (range 1-25).
 * Categories aligned to CPA raw score range:
 *   No Control: 100%
 *   Significant Improvement Needed (raw < 5): 80%
 *   Improvement Needed (raw ≥ 5 & < 10): 60%
 *   Meets Requirements (raw ≥ 10 & < 15): 40%
 *   Effective Control (raw ≥ 15 & < 25): 30%
 *   Significantly Effective Control (raw = 25): 20%
 */
export function getCPACategoryWeight(cpaRawScore: number | null): number {
  if (cpaRawScore === null) return 1.0;
  if (cpaRawScore < 5) return 0.8;
  if (cpaRawScore < 10) return 0.6;
  if (cpaRawScore < 15) return 0.4;
  if (cpaRawScore < 25) return 0.3;
  return 0.2;
}

/**
 * Computes the weighted average CPA for a set of controls.
 * Req 14.1: sum(count_per_category × weight) / total_controls
 */
export function computeWeightedAvgCPA(controls: CPIControlInput[]): { weightedAvg: number; breakdown: CPICategoryBreakdown } {
  if (controls.length === 0) {
    return {
      weightedAvg: 1.0,
      breakdown: { noControl: 0, significantImprovementNeeded: 0, improvementNeeded: 0, meetsRequirements: 0, effectiveControl: 0, significantlyEffectiveControl: 0 },
    };
  }

  const breakdown: CPICategoryBreakdown = {
    noControl: 0,
    significantImprovementNeeded: 0,
    improvementNeeded: 0,
    meetsRequirements: 0,
    effectiveControl: 0,
    significantlyEffectiveControl: 0,
  };

  let weightedSum = 0;
  for (const control of controls) {
    const raw = control.cpaRawScore;
    const weight = getCPACategoryWeight(raw);
    weightedSum += weight;

    if (raw === null) breakdown.noControl++;
    else if (raw < 5) breakdown.significantImprovementNeeded++;
    else if (raw < 10) breakdown.improvementNeeded++;
    else if (raw < 15) breakdown.meetsRequirements++;
    else if (raw < 25) breakdown.effectiveControl++;
    else breakdown.significantlyEffectiveControl++;
  }

  return {
    weightedAvg: weightedSum / controls.length,
    breakdown,
  };
}

/**
 * Interprets a CPI percentage to a score and label.
 * Req 14.3 (same thresholds as CQI):
 *   <40% → Significant Improvement Needed (score 1)
 *   ≥40% → Improvement Needed (score 4)
 *   ≥60% → Partially Effective (score 9)
 *   ≥70% → Meets Requirements (score 16)
 *   ≥80% → Effective (score 25)
 */
export function interpretCPI(cpiPercent: number): { interpScore: number; interpretation: IndexInterpretation } {
  if (cpiPercent >= 0.8) return { interpScore: 25, interpretation: IndexInterpretation.Effective };
  if (cpiPercent >= 0.7) return { interpScore: 16, interpretation: IndexInterpretation.MeetsRequirements };
  if (cpiPercent >= 0.6) return { interpScore: 9, interpretation: IndexInterpretation.PartiallyEffective };
  if (cpiPercent >= 0.4) return { interpScore: 4, interpretation: IndexInterpretation.ImprovementNeeded };
  return { interpScore: 1, interpretation: IndexInterpretation.SignificantImprovementNeeded };
}

/**
 * Calculates the full CPI result for an AU.
 * Req 14.1, 14.2, 14.3
 */
export function calculateCPI(controls: CPIControlInput[]): CPIResult {
  const { weightedAvg, breakdown } = computeWeightedAvgCPA(controls);
  const cpiScore = 1 - weightedAvg; // Req 14.2: CPI = 100% - weighted avg
  const { interpScore, interpretation } = interpretCPI(cpiScore);

  return {
    weightedAvg,
    cpiScore,
    interpScore,
    interpretation,
    categoryBreakdown: breakdown,
  };
}
