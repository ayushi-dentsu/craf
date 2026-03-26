/**
 * Control Quality Index (CQI) service for CRAF risk assessment.
 *
 * CQI = 100% − weighted average CQA
 *
 * Category weights (based on CQA raw score):
 *   No Control (obligations without control): 100%
 *   Significant Improvement Needed (<15): 80%
 *   Improvement Needed (≥15 & <30): 60%
 *   Meets Requirements (≥30 & <60): 40%
 *   Effective Control (≥60 & <125): 30%
 *   Significantly Effective Control (≥125): 20%
 *
 * Interpretation:
 *   <40% → Significant Improvement Needed (score 1)
 *   ≥40% → Improvement Needed (score 4)
 *   ≥60% → Partially Effective (score 9)
 *   ≥70% → Meets Requirements (score 16)
 *   ≥80% → Effective (score 25)
 *
 * Requirements: 11.1, 11.2, 11.3
 */

import { IndexInterpretation } from '../../types/enums.js';

/**
 * A control's CQA raw score for CQI aggregation.
 * Use `null` to represent an obligation with no control.
 */
export interface CQIControlInput {
  /** CQA raw score, or null if no control exists for the obligation */
  cqaRawScore: number | null;
}

/**
 * Result of CQI calculation for an AU.
 */
export interface CQIResult {
  /** Weighted average CQA (0-1 range) */
  weightedAvg: number;
  /** CQI percentage (0-1 range, i.e. 1 - weightedAvg) */
  cqiScore: number;
  /** Interpretation score: 1, 4, 9, 16, or 25 */
  interpScore: number;
  /** Interpretation label */
  interpretation: IndexInterpretation;
  /** Breakdown of control counts per category */
  categoryBreakdown: CQICategoryBreakdown;
}

export interface CQICategoryBreakdown {
  noControl: number;
  significantImprovementNeeded: number;
  improvementNeeded: number;
  meetsRequirements: number;
  effectiveControl: number;
  significantlyEffectiveControl: number;
}

/**
 * CQA category weight mapping based on raw score.
 * Req 11.1
 */
interface CategoryWeight {
  label: string;
  weight: number;
  test: (rawScore: number | null) => boolean;
}

const CQA_CATEGORY_WEIGHTS: CategoryWeight[] = [
  { label: 'No Control', weight: 1.0, test: (raw) => raw === null },
  { label: 'Significant Improvement Needed', weight: 0.8, test: (raw) => raw !== null && raw < 15 },
  { label: 'Improvement Needed', weight: 0.6, test: (raw) => raw !== null && raw >= 15 && raw < 30 },
  { label: 'Meets Requirements', weight: 0.4, test: (raw) => raw !== null && raw >= 30 && raw < 60 },
  { label: 'Effective Control', weight: 0.3, test: (raw) => raw !== null && raw >= 60 && raw < 125 },
  { label: 'Significantly Effective Control', weight: 0.2, test: (raw) => raw !== null && raw >= 125 },
];

/**
 * Determines the CQA category weight for a given raw score.
 * Req 11.1
 */
export function getCQACategoryWeight(cqaRawScore: number | null): number {
  for (const cat of CQA_CATEGORY_WEIGHTS) {
    if (cat.test(cqaRawScore)) return cat.weight;
  }
  // Fallback: treat as significant improvement needed
  return 0.8;
}

/**
 * Computes the weighted average CQA for a set of controls.
 * Req 11.1: sum(count_per_category × weight) / total_controls
 */
export function computeWeightedAvgCQA(controls: CQIControlInput[]): { weightedAvg: number; breakdown: CQICategoryBreakdown } {
  if (controls.length === 0) {
    return {
      weightedAvg: 1.0,
      breakdown: { noControl: 0, significantImprovementNeeded: 0, improvementNeeded: 0, meetsRequirements: 0, effectiveControl: 0, significantlyEffectiveControl: 0 },
    };
  }

  const breakdown: CQICategoryBreakdown = {
    noControl: 0,
    significantImprovementNeeded: 0,
    improvementNeeded: 0,
    meetsRequirements: 0,
    effectiveControl: 0,
    significantlyEffectiveControl: 0,
  };

  let weightedSum = 0;
  for (const control of controls) {
    const raw = control.cqaRawScore;
    const weight = getCQACategoryWeight(raw);
    weightedSum += weight;

    if (raw === null) breakdown.noControl++;
    else if (raw < 15) breakdown.significantImprovementNeeded++;
    else if (raw < 30) breakdown.improvementNeeded++;
    else if (raw < 60) breakdown.meetsRequirements++;
    else if (raw < 125) breakdown.effectiveControl++;
    else breakdown.significantlyEffectiveControl++;
  }

  return {
    weightedAvg: weightedSum / controls.length,
    breakdown,
  };
}

/**
 * Interprets a CQI percentage to a score and label.
 * Req 11.3:
 *   <40% → Significant Improvement Needed (score 1)
 *   ≥40% → Improvement Needed (score 4)
 *   ≥60% → Partially Effective (score 9)
 *   ≥70% → Meets Requirements (score 16)
 *   ≥80% → Effective (score 25)
 */
export function interpretCQI(cqiPercent: number): { interpScore: number; interpretation: IndexInterpretation } {
  if (cqiPercent >= 0.8) return { interpScore: 25, interpretation: IndexInterpretation.Effective };
  if (cqiPercent >= 0.7) return { interpScore: 16, interpretation: IndexInterpretation.MeetsRequirements };
  if (cqiPercent >= 0.6) return { interpScore: 9, interpretation: IndexInterpretation.PartiallyEffective };
  if (cqiPercent >= 0.4) return { interpScore: 4, interpretation: IndexInterpretation.ImprovementNeeded };
  return { interpScore: 1, interpretation: IndexInterpretation.SignificantImprovementNeeded };
}

/**
 * Calculates the full CQI result for an AU.
 * Req 11.1, 11.2, 11.3
 */
export function calculateCQI(controls: CQIControlInput[]): CQIResult {
  const { weightedAvg, breakdown } = computeWeightedAvgCQA(controls);
  const cqiScore = 1 - weightedAvg; // Req 11.2: CQI = 100% - weighted avg
  const { interpScore, interpretation } = interpretCQI(cqiScore);

  return {
    weightedAvg,
    cqiScore,
    interpScore,
    interpretation,
    categoryBreakdown: breakdown,
  };
}
