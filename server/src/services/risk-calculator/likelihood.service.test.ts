import { describe, it, expect } from 'vitest';
import {
  scoreVolumeGrowth,
  scoreComplexity,
  mapProductComplexityCategoryToScore,
  scoreRegulatoryReturns,
  scoreComplianceBreaches,
  scoreIcofrFailures,
  scoreCustomerComplaints,
  scaleLikelihood,
  mapLikelihoodRating,
  calculateLikelihood,
} from './likelihood.service.js';
import { LikelihoodRating, ProductComplexityCategory } from '../../types/enums.js';

describe('scoreVolumeGrowth', () => {
  it('returns 25 for >50%', () => {
    expect(scoreVolumeGrowth(51)).toBe(25);
    expect(scoreVolumeGrowth(100)).toBe(25);
  });
  it('returns 20 for 30%-50%', () => {
    expect(scoreVolumeGrowth(30)).toBe(20);
    expect(scoreVolumeGrowth(50)).toBe(20);
  });
  it('returns 15 for 20%-30%', () => {
    expect(scoreVolumeGrowth(20)).toBe(15);
    expect(scoreVolumeGrowth(29)).toBe(15);
  });
  it('returns 10 for 5%-20%', () => {
    expect(scoreVolumeGrowth(5)).toBe(10);
    expect(scoreVolumeGrowth(19)).toBe(10);
  });
  it('returns 5 for <5%', () => {
    expect(scoreVolumeGrowth(4)).toBe(5);
    expect(scoreVolumeGrowth(0)).toBe(5);
  });
});

describe('scoreComplexity', () => {
  it('returns max of product and system scores', () => {
    expect(scoreComplexity(ProductComplexityCategory.Low, 20)).toBe(20);
    expect(scoreComplexity(ProductComplexityCategory.High, 10)).toBe(25);
    expect(scoreComplexity(ProductComplexityCategory.Medium, 15)).toBe(15);
  });
});

describe('mapProductComplexityCategoryToScore', () => {
  it('maps Low→5, Medium→15, High→25', () => {
    expect(mapProductComplexityCategoryToScore(ProductComplexityCategory.Low)).toBe(5);
    expect(mapProductComplexityCategoryToScore(ProductComplexityCategory.Medium)).toBe(15);
    expect(mapProductComplexityCategoryToScore(ProductComplexityCategory.High)).toBe(25);
  });
});

describe('scoreRegulatoryReturns', () => {
  it('returns 25 for >15', () => expect(scoreRegulatoryReturns(16)).toBe(25));
  it('returns 20 for 11-15', () => {
    expect(scoreRegulatoryReturns(11)).toBe(20);
    expect(scoreRegulatoryReturns(15)).toBe(20);
  });
  it('returns 15 for 6-10', () => {
    expect(scoreRegulatoryReturns(6)).toBe(15);
    expect(scoreRegulatoryReturns(10)).toBe(15);
  });
  it('returns 10 for 1-5', () => {
    expect(scoreRegulatoryReturns(1)).toBe(10);
    expect(scoreRegulatoryReturns(5)).toBe(10);
  });
  it('returns 5 for 0', () => expect(scoreRegulatoryReturns(0)).toBe(5));
});

describe('scoreComplianceBreaches', () => {
  it('returns 25 for >1', () => expect(scoreComplianceBreaches(2)).toBe(25));
  it('returns 15 for exactly 1', () => expect(scoreComplianceBreaches(1)).toBe(15));
  it('returns 5 for 0', () => expect(scoreComplianceBreaches(0)).toBe(5));
});

describe('scoreIcofrFailures', () => {
  it('returns 25 for >1', () => expect(scoreIcofrFailures(3)).toBe(25));
  it('returns 15 for exactly 1', () => expect(scoreIcofrFailures(1)).toBe(15));
  it('returns 5 for 0', () => expect(scoreIcofrFailures(0)).toBe(5));
});

describe('scoreCustomerComplaints', () => {
  it('returns 25 for ≥25', () => {
    expect(scoreCustomerComplaints(25)).toBe(25);
    expect(scoreCustomerComplaints(100)).toBe(25);
  });
  it('returns 20 for ≥20 & <25', () => {
    expect(scoreCustomerComplaints(20)).toBe(20);
    expect(scoreCustomerComplaints(24)).toBe(20);
  });
  it('returns 15 for ≥15 & <20', () => {
    expect(scoreCustomerComplaints(15)).toBe(15);
    expect(scoreCustomerComplaints(19)).toBe(15);
  });
  it('returns 10 for ≥5 & <15', () => {
    expect(scoreCustomerComplaints(5)).toBe(10);
    expect(scoreCustomerComplaints(14)).toBe(10);
  });
  it('returns 5 for <5', () => {
    expect(scoreCustomerComplaints(4)).toBe(5);
    expect(scoreCustomerComplaints(0)).toBe(5);
  });
});

describe('scaleLikelihood', () => {
  it('maps 5 → 5', () => expect(scaleLikelihood(5)).toBe(5));
  it('maps >5 & <7.5 → 5', () => expect(scaleLikelihood(6)).toBe(5));
  it('maps 7.5 → 10', () => expect(scaleLikelihood(7.5)).toBe(10));
  it('maps 10 → 10', () => expect(scaleLikelihood(10)).toBe(10));
  it('maps >10 & <12.5 → 10', () => expect(scaleLikelihood(11)).toBe(10));
  it('maps 12.5 → 15', () => expect(scaleLikelihood(12.5)).toBe(15));
  it('maps 15 → 15', () => expect(scaleLikelihood(15)).toBe(15));
  it('maps >15 & <17.5 → 15', () => expect(scaleLikelihood(16)).toBe(15));
  it('maps 17.5 → 20', () => expect(scaleLikelihood(17.5)).toBe(20));
  it('maps 20 → 20', () => expect(scaleLikelihood(20)).toBe(20));
  it('maps >20 & <22.5 → 20', () => expect(scaleLikelihood(21)).toBe(20));
  it('maps 22.5 → 25', () => expect(scaleLikelihood(22.5)).toBe(25));
  it('maps 25 → 25', () => expect(scaleLikelihood(25)).toBe(25));
});

describe('mapLikelihoodRating', () => {
  it('maps 25 → Almost Certain', () => expect(mapLikelihoodRating(25)).toBe(LikelihoodRating.AlmostCertain));
  it('maps 20 → Likely', () => expect(mapLikelihoodRating(20)).toBe(LikelihoodRating.Likely));
  it('maps 15 → Possible', () => expect(mapLikelihoodRating(15)).toBe(LikelihoodRating.Possible));
  it('maps 10 → Unlikely', () => expect(mapLikelihoodRating(10)).toBe(LikelihoodRating.Unlikely));
  it('maps 5 → Rare', () => expect(mapLikelihoodRating(5)).toBe(LikelihoodRating.Rare));
});

describe('calculateLikelihood', () => {
  it('computes full likelihood for a high-risk AU', () => {
    const result = calculateLikelihood({
      volumeGrowthPercent: 55,
      systemComplexityScore: 20,
      productComplexityCategory: ProductComplexityCategory.High,
      regulatoryReturnsCount: 20,
      complianceBreachCount: 3,
      icofrFailureCount: 2,
      customerComplaintCount: 30,
    });
    // All params score 25
    expect(result.parameterScores.volumeGrowth).toBe(25);
    expect(result.parameterScores.complexity).toBe(25);
    expect(result.parameterScores.regulatoryReturns).toBe(25);
    expect(result.parameterScores.complianceBreaches).toBe(25);
    expect(result.parameterScores.icofrFailures).toBe(25);
    expect(result.parameterScores.customerComplaints).toBe(25);
    expect(result.rawAverage).toBe(25);
    expect(result.scaledScore).toBe(25);
    expect(result.rating).toBe(LikelihoodRating.AlmostCertain);
  });

  it('computes full likelihood for a low-risk AU', () => {
    const result = calculateLikelihood({
      volumeGrowthPercent: 2,
      systemComplexityScore: 5,
      productComplexityCategory: ProductComplexityCategory.Low,
      regulatoryReturnsCount: 0,
      complianceBreachCount: 0,
      icofrFailureCount: 0,
      customerComplaintCount: 2,
    });
    // All params score 5
    expect(result.parameterScores.volumeGrowth).toBe(5);
    expect(result.parameterScores.complexity).toBe(5);
    expect(result.parameterScores.regulatoryReturns).toBe(5);
    expect(result.parameterScores.complianceBreaches).toBe(5);
    expect(result.parameterScores.icofrFailures).toBe(5);
    expect(result.parameterScores.customerComplaints).toBe(5);
    expect(result.rawAverage).toBe(5);
    expect(result.scaledScore).toBe(5);
    expect(result.rating).toBe(LikelihoodRating.Rare);
  });

  it('computes a mixed-risk scenario with correct average and scaling', () => {
    const result = calculateLikelihood({
      volumeGrowthPercent: 35,       // → 20
      systemComplexityScore: 10,
      productComplexityCategory: ProductComplexityCategory.Medium, // → max(15,10) = 15
      regulatoryReturnsCount: 8,     // → 15
      complianceBreachCount: 1,      // → 15
      icofrFailureCount: 0,          // → 5
      customerComplaintCount: 10,    // → 10
    });
    expect(result.parameterScores.volumeGrowth).toBe(20);
    expect(result.parameterScores.complexity).toBe(15);
    expect(result.parameterScores.regulatoryReturns).toBe(15);
    expect(result.parameterScores.complianceBreaches).toBe(15);
    expect(result.parameterScores.icofrFailures).toBe(5);
    expect(result.parameterScores.customerComplaints).toBe(10);
    // avg = (20+15+15+15+5+10)/6 = 80/6 ≈ 13.33
    expect(result.rawAverage).toBeCloseTo(80 / 6);
    // 13.33 is ≥12.5 & <17.5 → 15
    expect(result.scaledScore).toBe(15);
    expect(result.rating).toBe(LikelihoodRating.Possible);
  });
});
