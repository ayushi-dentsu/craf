/**
 * Control Performance Assessment (CPA) service for CRAF risk assessment.
 *
 * Evaluates control operating effectiveness from:
 *   1. KCI monitoring & self-assessment scoring matrix
 *   2. Control testing results
 *
 * CPA raw = KCI/SA score × testing score
 * Scaling: 1→5, 3→5, 5→5, 9→10, 15→15, 25→25
 *
 * Requirements: 12.1-12.12, 13.1, 13.2, 13.3, 13.4
 */

import {
  CPACategory,
  ControlRiskType,
  ControlTestingResult,
  KCIResult,
  SelfAssessmentResult,
} from '../../types/enums.js';

/**
 * Input for CPA calculation for a single control.
 */
export interface CPAInput {
  controlRiskType: ControlRiskType;
  kciLinked: boolean;
  kciResult: KCIResult | null;
  selfAssessmentResult: SelfAssessmentResult;
  controlTestingResult: ControlTestingResult;
}

/**
 * Result of CPA calculation for a single control.
 */
export interface CPAResult {
  kciSelfAssessmentScore: number;
  controlTestingScore: number;
  rawScore: number;
  scaledScore: number;
  category: CPACategory;
}

/**
 * Scores KCI/Self-Assessment for Compliance controls.
 * Req 12.1-12.5:
 *   KCI linked + KCI Pass + SA Pass → 5
 *   KCI linked + KCI Fail + SA Pass → 1
 *   KCI linked + KCI Pass + SA Fail → 1
 *   KCI not linked + SA Pass → 3
 *   KCI not linked + SA Fail → 1
 */
function scoreComplianceKCISA(
  kciLinked: boolean,
  kciResult: KCIResult | null,
  saResult: SelfAssessmentResult,
): number {
  if (kciLinked) {
    if (kciResult === KCIResult.Pass && saResult === SelfAssessmentResult.Pass) return 5;
    if (kciResult === KCIResult.Fail && saResult === SelfAssessmentResult.Pass) return 1;
    if (kciResult === KCIResult.Pass && saResult === SelfAssessmentResult.Fail) return 1;
    // KCI Fail + SA Fail
    return 1;
  }
  // KCI not linked
  if (saResult === SelfAssessmentResult.Pass) return 3;
  return 1;
}

/**
 * Scores KCI/Self-Assessment for ICOFR and Converged controls.
 * Req 12.6-12.12:
 *   KCI linked + KCI Pass + SA Pass → 5
 *   KCI linked + KCI Pass + SA Pass with Exception → 3
 *   KCI linked + KCI Pass + SA Fail → 1
 *   KCI linked + KCI Fail (regardless of SA) → 1
 *   KCI not linked + SA Pass or Pass with Exception → 3
 *   KCI not linked + SA Fail → 1
 */
function scoreICOFRKCISA(
  kciLinked: boolean,
  kciResult: KCIResult | null,
  saResult: SelfAssessmentResult,
): number {
  if (kciLinked) {
    if (kciResult === KCIResult.Fail) return 1;
    if (kciResult === KCIResult.Pass) {
      if (saResult === SelfAssessmentResult.Pass) return 5;
      if (saResult === SelfAssessmentResult.PassWithException) return 3;
      return 1; // SA Fail
    }
    return 1;
  }
  // KCI not linked
  if (saResult === SelfAssessmentResult.Pass || saResult === SelfAssessmentResult.PassWithException) return 3;
  return 1;
}

/**
 * Scores KCI/Self-Assessment based on control risk type.
 * Req 12.12: Converged controls use same matrix as ICOFR.
 */
export function scoreKCISelfAssessment(
  controlRiskType: ControlRiskType,
  kciLinked: boolean,
  kciResult: KCIResult | null,
  saResult: SelfAssessmentResult,
): number {
  if (controlRiskType === ControlRiskType.Compliance) {
    return scoreComplianceKCISA(kciLinked, kciResult, saResult);
  }
  // ICOFR and Converged use the same matrix
  return scoreICOFRKCISA(kciLinked, kciResult, saResult);
}

/**
 * Scores control testing results.
 * Req 13.1: Pass→5, Pass with Exception→3, Fail→1, Not Tested→5
 */
export function scoreControlTesting(result: ControlTestingResult): number {
  switch (result) {
    case ControlTestingResult.Pass:
      return 5;
    case ControlTestingResult.PassWithException:
      return 3;
    case ControlTestingResult.Fail:
      return 1;
    case ControlTestingResult.NotTested:
      return 5;
  }
}

/**
 * Scales a CPA raw score.
 * Req 13.3: 1→5, 3→5, 5→5, 9→10, 15→15, 25→25
 */
export function scaleCPA(rawScore: number): number {
  if (rawScore <= 5) return 5;
  if (rawScore <= 9) return 10;
  if (rawScore <= 15) return 15;
  return 25;
}

/**
 * Maps a scaled CPA score to a category.
 * Req 13.4:
 *   5 → Significant Improvement Needed
 *   10 → Improvement Needed
 *   15 → Meets Requirement
 *   20 → Effective Control
 *   25 → Significantly Effective Control
 */
export function mapCPACategory(scaledScore: number): CPACategory {
  switch (scaledScore) {
    case 5:
      return CPACategory.SignificantImprovementNeeded;
    case 10:
      return CPACategory.ImprovementNeeded;
    case 15:
      return CPACategory.MeetsRequirement;
    case 20:
      return CPACategory.EffectiveControl;
    case 25:
      return CPACategory.SignificantlyEffectiveControl;
    default:
      return CPACategory.SignificantImprovementNeeded;
  }
}

/**
 * Calculates the full CPA result for a single control.
 * Req 12.1-12.12, 13.1-13.4
 */
export function calculateCPA(input: CPAInput): CPAResult {
  const kciSelfAssessmentScore = scoreKCISelfAssessment(
    input.controlRiskType,
    input.kciLinked,
    input.kciResult,
    input.selfAssessmentResult,
  );
  const controlTestingScore = scoreControlTesting(input.controlTestingResult);
  const rawScore = kciSelfAssessmentScore * controlTestingScore; // Req 13.2
  const scaledScore = scaleCPA(rawScore);
  const category = mapCPACategory(scaledScore);

  return {
    kciSelfAssessmentScore,
    controlTestingScore,
    rawScore,
    scaledScore,
    category,
  };
}
