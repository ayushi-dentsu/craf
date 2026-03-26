import { SystemTier } from '../../types/enums.js';

/**
 * Input for a single system mapped to an AU.
 */
export interface SystemComplexityInput {
  systemName: string;
  interfaceCount: number;
  tierCategory: SystemTier;
  changeRequests: number;
}

/**
 * Result for a single system's complexity scoring.
 */
export interface SystemScoreResult {
  systemName: string;
  interfaceScore: number;
  tierScore: number;
  changeScore: number;
  weightedAvg: number;
  finalScore: number;
}

/**
 * Result for an AU's overall system complexity (may include multiple systems).
 */
export interface SystemComplexityResult {
  systems: SystemScoreResult[];
  averageScore: number;
  scaledScore: number;
}

/**
 * Scores number of interfaces.
 * Req 7.2: 5 for 0-3, 10 for 4-9, 15 for 10-15, 20 for 16-24, 25 for >25
 */
export function scoreInterfaces(count: number): number {
  if (count > 25) return 25;
  if (count >= 16) return 20;
  if (count >= 10) return 15;
  if (count >= 4) return 10;
  return 5;
}

/**
 * Scores critical system tier categorization.
 * Req 7.3: 5 for Tier 3, 15 for Tier 2, 20 for Tier 1, 25 for Tier 0
 */
export function scoreTier(tier: SystemTier): number {
  switch (tier) {
    case SystemTier.Tier0:
      return 25;
    case SystemTier.Tier1:
      return 20;
    case SystemTier.Tier2:
      return 15;
    case SystemTier.Tier3:
      return 5;
  }
}

/**
 * Scores number of change requests.
 * Req 7.4: 5 for ≤5, 10 for >5 up to 10, 15 for >10 up to 20, 20 for >20 up to 30, 25 for >30
 */
export function scoreChangeRequests(count: number): number {
  if (count > 30) return 25;
  if (count > 20) return 20;
  if (count > 10) return 15;
  if (count > 5) return 10;
  return 5;
}

/**
 * Rounds a value up to the next multiple of 5.
 * Req 7.5: round to next multiple of 5
 * Examples: 12.3 → 15, 10 → 10, 10.1 → 15
 */
export function roundToNextMultipleOf5(value: number): number {
  return Math.ceil(value / 5) * 5;
}

/**
 * Applies the standard score band scaling to an average.
 * Maps to nearest standard score band {5, 10, 15, 20, 25}.
 * Uses the same scaling table as likelihood:
 *   ≤5 → 5, <7.5 → 5, <12.5 → 10, <17.5 → 15, <22.5 → 20, ≥22.5 → 25
 */
export function scaleToStandardBand(avg: number): number {
  if (avg <= 5) return 5;
  if (avg < 7.5) return 5;
  if (avg < 12.5) return 10;
  if (avg < 17.5) return 15;
  if (avg < 22.5) return 20;
  return 25;
}

/**
 * Calculates the complexity score for a single system.
 * Req 7.5: weighted average of 3 params, rounded to next multiple of 5.
 * Equal weights (1/3 each) since no specific weights are defined.
 */
export function calculateSingleSystemScore(input: SystemComplexityInput): SystemScoreResult {
  const interfaceScore = scoreInterfaces(input.interfaceCount);
  const tierScore = scoreTier(input.tierCategory);
  const changeScore = scoreChangeRequests(input.changeRequests);

  const weightedAvg = (interfaceScore + tierScore + changeScore) / 3;
  const finalScore = roundToNextMultipleOf5(weightedAvg);

  return {
    systemName: input.systemName,
    interfaceScore,
    tierScore,
    changeScore,
    weightedAvg,
    finalScore,
  };
}

/**
 * Calculates system complexity for an AU with one or more systems.
 * Req 7.5: Single system → weighted avg rounded to next multiple of 5.
 * Req 7.6: Multiple systems → simple average of final scores, then scale to nearest standard band.
 *
 * If no systems are provided, returns a default minimum score of 5.
 */
export function calculateSystemComplexity(systems: SystemComplexityInput[]): SystemComplexityResult {
  if (systems.length === 0) {
    return {
      systems: [],
      averageScore: 5,
      scaledScore: 5,
    };
  }

  const systemResults = systems.map(calculateSingleSystemScore);

  if (systemResults.length === 1) {
    const single = systemResults[0];
    return {
      systems: systemResults,
      averageScore: single.finalScore,
      scaledScore: single.finalScore,
    };
  }

  // Multiple systems: simple average of final scores, then scale
  const avg = systemResults.reduce((sum, s) => sum + s.finalScore, 0) / systemResults.length;
  const scaledScore = scaleToStandardBand(avg);

  return {
    systems: systemResults,
    averageScore: avg,
    scaledScore,
  };
}
