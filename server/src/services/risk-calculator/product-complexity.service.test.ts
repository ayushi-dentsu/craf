import { describe, it, expect } from 'vitest';
import {
  calculateRawScore,
  categorizeBusinessGroup,
  categorizeOpsSupport,
  categorize,
  calculateProductComplexity,
} from './product-complexity.service.js';
import { ProductComplexityCategory } from '../../types/enums.js';
import type { ProductComplexityInput } from './product-complexity.service.js';

describe('calculateRawScore', () => {
  it('multiplies all 5 params for Business Group', () => {
    const input: ProductComplexityInput = {
      auType: 'Business Group',
      easeOfUnderstanding: 3,
      productVariants: 3,
      regulatoryGuidelines: 3,
      complexityOfGuidelines: 3,
      supervisoryFocus: 3,
    };
    // 3*3*3*3*3 = 243
    expect(calculateRawScore(input)).toBe(243);
  });

  it('multiplies only 4 params for Operations/Support Group (excludes productVariants)', () => {
    const input: ProductComplexityInput = {
      auType: 'Operations/Support Group',
      easeOfUnderstanding: 3,
      productVariants: 9, // should be ignored
      regulatoryGuidelines: 3,
      complexityOfGuidelines: 3,
      supervisoryFocus: 3,
    };
    // 3*3*3*3 = 81
    expect(calculateRawScore(input)).toBe(81);
  });

  it('handles all-minimum scores for Business Group', () => {
    const input: ProductComplexityInput = {
      auType: 'Business Group',
      easeOfUnderstanding: 1,
      productVariants: 1,
      regulatoryGuidelines: 1,
      complexityOfGuidelines: 1,
      supervisoryFocus: 1,
    };
    expect(calculateRawScore(input)).toBe(1);
  });

  it('handles all-maximum scores for Business Group', () => {
    const input: ProductComplexityInput = {
      auType: 'Business Group',
      easeOfUnderstanding: 9,
      productVariants: 9,
      regulatoryGuidelines: 9,
      complexityOfGuidelines: 9,
      supervisoryFocus: 9,
    };
    // 9^5 = 59049
    expect(calculateRawScore(input)).toBe(59049);
  });

  it('handles all-maximum scores for Ops/Support Group', () => {
    const input: ProductComplexityInput = {
      auType: 'Operations/Support Group',
      easeOfUnderstanding: 9,
      regulatoryGuidelines: 9,
      complexityOfGuidelines: 9,
      supervisoryFocus: 9,
    };
    // 9^4 = 6561
    expect(calculateRawScore(input)).toBe(6561);
  });

  it('defaults productVariants to 1 when null for Business Group', () => {
    const input: ProductComplexityInput = {
      auType: 'Business Group',
      easeOfUnderstanding: 3,
      productVariants: null,
      regulatoryGuidelines: 3,
      complexityOfGuidelines: 3,
      supervisoryFocus: 3,
    };
    // 3*1*3*3*3 = 81
    expect(calculateRawScore(input)).toBe(81);
  });
});

describe('categorizeBusinessGroup', () => {
  it('returns Low for score ≤243', () => {
    expect(categorizeBusinessGroup(1)).toBe(ProductComplexityCategory.Low);
    expect(categorizeBusinessGroup(243)).toBe(ProductComplexityCategory.Low);
  });

  it('returns Medium for score 244-2187', () => {
    expect(categorizeBusinessGroup(244)).toBe(ProductComplexityCategory.Medium);
    expect(categorizeBusinessGroup(2187)).toBe(ProductComplexityCategory.Medium);
  });

  it('returns High for score >2187', () => {
    expect(categorizeBusinessGroup(2188)).toBe(ProductComplexityCategory.High);
    expect(categorizeBusinessGroup(59049)).toBe(ProductComplexityCategory.High);
  });
});

describe('categorizeOpsSupport', () => {
  it('returns Low for score ≤81', () => {
    expect(categorizeOpsSupport(1)).toBe(ProductComplexityCategory.Low);
    expect(categorizeOpsSupport(81)).toBe(ProductComplexityCategory.Low);
  });

  it('returns Medium for score 82-729', () => {
    expect(categorizeOpsSupport(82)).toBe(ProductComplexityCategory.Medium);
    expect(categorizeOpsSupport(729)).toBe(ProductComplexityCategory.Medium);
  });

  it('returns High for score >729', () => {
    expect(categorizeOpsSupport(730)).toBe(ProductComplexityCategory.High);
    expect(categorizeOpsSupport(6561)).toBe(ProductComplexityCategory.High);
  });
});

describe('categorize', () => {
  it('delegates to Business Group thresholds', () => {
    expect(categorize(243, 'Business Group')).toBe(ProductComplexityCategory.Low);
    expect(categorize(244, 'Business Group')).toBe(ProductComplexityCategory.Medium);
    expect(categorize(2188, 'Business Group')).toBe(ProductComplexityCategory.High);
  });

  it('delegates to Ops/Support thresholds', () => {
    expect(categorize(81, 'Operations/Support Group')).toBe(ProductComplexityCategory.Low);
    expect(categorize(82, 'Operations/Support Group')).toBe(ProductComplexityCategory.Medium);
    expect(categorize(730, 'Operations/Support Group')).toBe(ProductComplexityCategory.High);
  });
});

describe('calculateProductComplexity', () => {
  it('returns correct rawScore and category for Business Group — Low', () => {
    const result = calculateProductComplexity({
      auType: 'Business Group',
      easeOfUnderstanding: 3,
      productVariants: 3,
      regulatoryGuidelines: 3,
      complexityOfGuidelines: 3,
      supervisoryFocus: 3,
    });
    expect(result.rawScore).toBe(243);
    expect(result.category).toBe(ProductComplexityCategory.Low);
  });

  it('returns correct rawScore and category for Business Group — Medium', () => {
    const result = calculateProductComplexity({
      auType: 'Business Group',
      easeOfUnderstanding: 9,
      productVariants: 3,
      regulatoryGuidelines: 3,
      complexityOfGuidelines: 3,
      supervisoryFocus: 3,
    });
    // 9*3*3*3*3 = 729
    expect(result.rawScore).toBe(729);
    expect(result.category).toBe(ProductComplexityCategory.Medium);
  });

  it('returns correct rawScore and category for Business Group — High', () => {
    const result = calculateProductComplexity({
      auType: 'Business Group',
      easeOfUnderstanding: 9,
      productVariants: 9,
      regulatoryGuidelines: 9,
      complexityOfGuidelines: 3,
      supervisoryFocus: 3,
    });
    // 9*9*9*3*3 = 6561
    expect(result.rawScore).toBe(6561);
    expect(result.category).toBe(ProductComplexityCategory.High);
  });

  it('returns correct rawScore and category for Ops/Support — Low', () => {
    const result = calculateProductComplexity({
      auType: 'Operations/Support Group',
      easeOfUnderstanding: 3,
      regulatoryGuidelines: 3,
      complexityOfGuidelines: 3,
      supervisoryFocus: 3,
    });
    // 3*3*3*3 = 81
    expect(result.rawScore).toBe(81);
    expect(result.category).toBe(ProductComplexityCategory.Low);
  });

  it('returns correct rawScore and category for Ops/Support — Medium', () => {
    const result = calculateProductComplexity({
      auType: 'Operations/Support Group',
      easeOfUnderstanding: 9,
      regulatoryGuidelines: 3,
      complexityOfGuidelines: 3,
      supervisoryFocus: 3,
    });
    // 9*3*3*3 = 243
    expect(result.rawScore).toBe(243);
    expect(result.category).toBe(ProductComplexityCategory.Medium);
  });

  it('returns correct rawScore and category for Ops/Support — High', () => {
    const result = calculateProductComplexity({
      auType: 'Operations/Support Group',
      easeOfUnderstanding: 9,
      regulatoryGuidelines: 9,
      complexityOfGuidelines: 9,
      supervisoryFocus: 9,
    });
    // 9^4 = 6561
    expect(result.rawScore).toBe(6561);
    expect(result.category).toBe(ProductComplexityCategory.High);
  });

  it('Ops/Support ignores productVariants even when provided', () => {
    const result = calculateProductComplexity({
      auType: 'Operations/Support Group',
      easeOfUnderstanding: 1,
      productVariants: 9,
      regulatoryGuidelines: 1,
      complexityOfGuidelines: 1,
      supervisoryFocus: 1,
    });
    // 1*1*1*1 = 1 (productVariants=9 ignored)
    expect(result.rawScore).toBe(1);
    expect(result.category).toBe(ProductComplexityCategory.Low);
  });
});
