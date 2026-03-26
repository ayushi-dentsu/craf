import { ProductComplexityCategory } from '../../types/enums.js';

/** Valid scores for each product complexity parameter. */
export type ParamScore = 1 | 3 | 9;

/** AU type determines which thresholds and parameters apply. */
export type AUType = 'Business Group' | 'Operations/Support Group';

/**
 * Input for product complexity calculation.
 * For Operations/Support Groups, productVariants should be omitted (null/undefined).
 */
export interface ProductComplexityInput {
  auType: AUType;
  easeOfUnderstanding: ParamScore;
  productVariants?: ParamScore | null;
  regulatoryGuidelines: ParamScore;
  complexityOfGuidelines: ParamScore;
  supervisoryFocus: ParamScore;
}

/**
 * Result of product complexity calculation.
 */
export interface ProductComplexityResult {
  rawScore: number;
  category: ProductComplexityCategory;
}

/**
 * Computes the product complexity raw score.
 * Req 8.3: Multiply all parameter scores together.
 * Req 8.6: For Operations/Support Groups, exclude product variants.
 */
export function calculateRawScore(input: ProductComplexityInput): number {
  const { auType, easeOfUnderstanding, productVariants, regulatoryGuidelines, complexityOfGuidelines, supervisoryFocus } = input;

  if (auType === 'Operations/Support Group') {
    // Req 8.6: exclude product variants
    return easeOfUnderstanding * regulatoryGuidelines * complexityOfGuidelines * supervisoryFocus;
  }

  // Business Group: all 5 params
  const pv = productVariants ?? 1;
  return easeOfUnderstanding * pv * regulatoryGuidelines * complexityOfGuidelines * supervisoryFocus;
}

/**
 * Categorizes a raw score for Business Groups.
 * Req 8.4: ≤243 Low, 244-2187 Medium, >2188 High
 */
export function categorizeBusinessGroup(rawScore: number): ProductComplexityCategory {
  if (rawScore <= 243) return ProductComplexityCategory.Low;
  if (rawScore <= 2187) return ProductComplexityCategory.Medium;
  return ProductComplexityCategory.High;
}

/**
 * Categorizes a raw score for Operations/Support Groups.
 * Req 8.5: ≤81 Low, 82-729 Medium, >729 High
 */
export function categorizeOpsSupport(rawScore: number): ProductComplexityCategory {
  if (rawScore <= 81) return ProductComplexityCategory.Low;
  if (rawScore <= 729) return ProductComplexityCategory.Medium;
  return ProductComplexityCategory.High;
}

/**
 * Categorizes a raw score based on AU type.
 */
export function categorize(rawScore: number, auType: AUType): ProductComplexityCategory {
  return auType === 'Operations/Support Group'
    ? categorizeOpsSupport(rawScore)
    : categorizeBusinessGroup(rawScore);
}

/**
 * Calculates product complexity score and category for an AU.
 * Req 8.1-8.6
 */
export function calculateProductComplexity(input: ProductComplexityInput): ProductComplexityResult {
  const rawScore = calculateRawScore(input);
  const category = categorize(rawScore, input.auType);
  return { rawScore, category };
}
