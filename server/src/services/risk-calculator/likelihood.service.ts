import { LikelihoodRating, ProductComplexityCategory } from '../../types/enums.js';

/**
 * Input parameters for likelihood calculation at the AU level.
 */
export interface LikelihoodInput {
  volumeGrowthPercent: number;
  systemComplexityScore: number;
  productComplexityCategory: ProductComplexityCategory;
  regulatoryReturnsCount: number;
  complianceBreachCount: number;
  icofrFailureCount: number;
  customerComplaintCount: number;
}

/**
 * Result of the full likelihood calculation.
 */
export interface LikelihoodResult {
  parameterScores: {
    volumeGrowth: number;
    complexity: number;
    regulatoryReturns: number;
    complianceBreaches: number;
    icofrFailures: number;
    customerComplaints: number;
  };
  rawAverage: number;
  scaledScore: number;
  rating: LikelihoodRating;
}

/**
 * Scores business/transaction volume increase.
 * Req 4.2: 25 for >50%, 20 for 30%-50%, 15 for 20%-30%, 10 for 5%-20%, 5 for <5%
 */
export function scoreVolumeGrowth(percent: number): number {
  if (percent > 50) return 25;
  if (percent >= 30) return 20;
  if (percent >= 20) return 15;
  if (percent >= 5) return 10;
  return 5;
}

/**
 * Scores complexity of products and systems.
 * Req 4.3: max(product complexity score, system complexity score)
 *
 * Product complexity category is mapped to a numeric score:
 *   Low → 5, Medium → 15, High → 25
 */
export function scoreComplexity(
  productComplexityCategory: ProductComplexityCategory,
  systemComplexityScore: number,
): number {
  const productScore = mapProductComplexityCategoryToScore(productComplexityCategory);
  return Math.max(productScore, systemComplexityScore);
}

/**
 * Maps a ProductComplexityCategory to a numeric score for use in likelihood.
 */
export function mapProductComplexityCategoryToScore(
  category: ProductComplexityCategory,
): number {
  switch (category) {
    case ProductComplexityCategory.Low:
      return 5;
    case ProductComplexityCategory.Medium:
      return 15;
    case ProductComplexityCategory.High:
      return 25;
  }
}

/**
 * Scores number of regulatory returns.
 * Req 4.4: 25 for >15, 20 for 11-15, 15 for 6-10, 10 for 1-5, 5 for 0
 */
export function scoreRegulatoryReturns(count: number): number {
  if (count > 15) return 25;
  if (count >= 11) return 20;
  if (count >= 6) return 15;
  if (count >= 1) return 10;
  return 5;
}

/**
 * Scores compliance breaches in previous 12 months.
 * Req 4.5: 25 for >1, 15 for exactly 1, 5 for 0
 */
export function scoreComplianceBreaches(count: number): number {
  if (count > 1) return 25;
  if (count === 1) return 15;
  return 5;
}

/**
 * Scores ICOFR control failures in previous 12 months.
 * Req 4.6: 25 for >1, 15 for exactly 1, 5 for 0
 */
export function scoreIcofrFailures(count: number): number {
  if (count > 1) return 25;
  if (count === 1) return 15;
  return 5;
}

/**
 * Scores customer complaints.
 * Req 4.7: 25 for ≥25, 20 for ≥20&<25, 15 for ≥15&<20, 10 for ≥5&<15, 5 for <5
 */
export function scoreCustomerComplaints(count: number): number {
  if (count >= 25) return 25;
  if (count >= 20) return 20;
  if (count >= 15) return 15;
  if (count >= 5) return 10;
  return 5;
}

/**
 * Applies the likelihood scaling table to a raw average.
 * Req 4.8:
 *   >5 & <7.5 → 5
 *   ≥7.5 & ≤10 → 10
 *   >10 & <12.5 → 10
 *   ≥12.5 & ≤15 → 15
 *   >15 & <17.5 → 15
 *   ≥17.5 & ≤20 → 20
 *   >20 & <22.5 → 20
 *   ≥22.5 & ≤25 → 25
 *
 * Edge: if rawAvg is exactly 5, it maps to 5.
 */
export function scaleLikelihood(rawAvg: number): number {
  if (rawAvg <= 5) return 5;
  if (rawAvg < 7.5) return 5;
  if (rawAvg < 12.5) return 10;
  if (rawAvg < 17.5) return 15;
  if (rawAvg < 22.5) return 20;
  return 25;
}

/**
 * Maps a scaled likelihood score to a rating.
 * Req 4.9: 25→Almost Certain, 20→Likely, 15→Possible, 10→Unlikely, 5→Rare
 */
export function mapLikelihoodRating(scaledScore: number): LikelihoodRating {
  switch (scaledScore) {
    case 25:
      return LikelihoodRating.AlmostCertain;
    case 20:
      return LikelihoodRating.Likely;
    case 15:
      return LikelihoodRating.Possible;
    case 10:
      return LikelihoodRating.Unlikely;
    case 5:
    default:
      return LikelihoodRating.Rare;
  }
}

/**
 * Calculates the full likelihood result for an Assessment Unit.
 * Req 4.1: Evaluates all 6 parameters, computes average, scales, and assigns rating.
 */
export function calculateLikelihood(input: LikelihoodInput): LikelihoodResult {
  const parameterScores = {
    volumeGrowth: scoreVolumeGrowth(input.volumeGrowthPercent),
    complexity: scoreComplexity(input.productComplexityCategory, input.systemComplexityScore),
    regulatoryReturns: scoreRegulatoryReturns(input.regulatoryReturnsCount),
    complianceBreaches: scoreComplianceBreaches(input.complianceBreachCount),
    icofrFailures: scoreIcofrFailures(input.icofrFailureCount),
    customerComplaints: scoreCustomerComplaints(input.customerComplaintCount),
  };

  const scores = Object.values(parameterScores);
  const rawAverage = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const scaledScore = scaleLikelihood(rawAverage);
  const rating = mapLikelihoodRating(scaledScore);

  return {
    parameterScores,
    rawAverage,
    scaledScore,
    rating,
  };
}
