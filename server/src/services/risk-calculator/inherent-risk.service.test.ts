import { describe, it, expect } from 'vitest';
import { InherentRiskRating } from '../../types/enums.js';
import {
  calculateInherentRisk,
  mapInherentRiskRating,
} from './inherent-risk.service.js';

describe('mapInherentRiskRating', () => {
  it('returns Extremely High for score ≥ 375', () => {
    expect(mapInherentRiskRating(375)).toBe(InherentRiskRating.ExtremelyHigh);
    expect(mapInherentRiskRating(500)).toBe(InherentRiskRating.ExtremelyHigh);
    expect(mapInherentRiskRating(625)).toBe(InherentRiskRating.ExtremelyHigh);
  });

  it('returns Very High for score ≥ 200 and < 375', () => {
    expect(mapInherentRiskRating(200)).toBe(InherentRiskRating.VeryHigh);
    expect(mapInherentRiskRating(300)).toBe(InherentRiskRating.VeryHigh);
    expect(mapInherentRiskRating(374)).toBe(InherentRiskRating.VeryHigh);
  });

  it('returns High for score ≥ 100 and < 200', () => {
    expect(mapInherentRiskRating(100)).toBe(InherentRiskRating.High);
    expect(mapInherentRiskRating(150)).toBe(InherentRiskRating.High);
    expect(mapInherentRiskRating(199)).toBe(InherentRiskRating.High);
  });

  it('returns Minor for score ≥ 25 and < 100', () => {
    expect(mapInherentRiskRating(25)).toBe(InherentRiskRating.Minor);
    expect(mapInherentRiskRating(50)).toBe(InherentRiskRating.Minor);
    expect(mapInherentRiskRating(99)).toBe(InherentRiskRating.Minor);
  });

  it('returns Insignificant for score < 25', () => {
    expect(mapInherentRiskRating(0)).toBe(InherentRiskRating.Insignificant);
    expect(mapInherentRiskRating(24)).toBe(InherentRiskRating.Insignificant);
  });
});

describe('calculateInherentRisk', () => {
  it('computes IR = likelihood × impact (Req 6.1)', () => {
    const result = calculateInherentRisk({ likelihoodScore: 25, impactScore: 25 });
    expect(result.inherentRiskScore).toBe(625);
  });

  it('returns Extremely High for 25 × 15 = 375 (Req 6.2)', () => {
    const result = calculateInherentRisk({ likelihoodScore: 25, impactScore: 15 });
    expect(result.inherentRiskScore).toBe(375);
    expect(result.rating).toBe(InherentRiskRating.ExtremelyHigh);
  });

  it('returns Very High for 20 × 15 = 300 (Req 6.3)', () => {
    const result = calculateInherentRisk({ likelihoodScore: 20, impactScore: 15 });
    expect(result.inherentRiskScore).toBe(300);
    expect(result.rating).toBe(InherentRiskRating.VeryHigh);
  });

  it('returns High for 10 × 15 = 150 (Req 6.4)', () => {
    const result = calculateInherentRisk({ likelihoodScore: 10, impactScore: 15 });
    expect(result.inherentRiskScore).toBe(150);
    expect(result.rating).toBe(InherentRiskRating.High);
  });

  it('returns Minor for 5 × 10 = 50 (Req 6.5)', () => {
    const result = calculateInherentRisk({ likelihoodScore: 5, impactScore: 10 });
    expect(result.inherentRiskScore).toBe(50);
    expect(result.rating).toBe(InherentRiskRating.Minor);
  });

  it('returns Insignificant for 5 × 4 = 20 (Req 6.6)', () => {
    const result = calculateInherentRisk({ likelihoodScore: 4, impactScore: 5 });
    expect(result.inherentRiskScore).toBe(20);
    expect(result.rating).toBe(InherentRiskRating.Insignificant);
  });

  it('preserves input scores in the result', () => {
    const result = calculateInherentRisk({ likelihoodScore: 15, impactScore: 20 });
    expect(result.likelihoodScore).toBe(15);
    expect(result.impactScore).toBe(20);
    expect(result.inherentRiskScore).toBe(300);
  });

  it('handles boundary at exactly 25 (Minor threshold)', () => {
    const result = calculateInherentRisk({ likelihoodScore: 5, impactScore: 5 });
    expect(result.inherentRiskScore).toBe(25);
    expect(result.rating).toBe(InherentRiskRating.Minor);
  });

  it('handles boundary at exactly 100 (High threshold)', () => {
    const result = calculateInherentRisk({ likelihoodScore: 10, impactScore: 10 });
    expect(result.inherentRiskScore).toBe(100);
    expect(result.rating).toBe(InherentRiskRating.High);
  });

  it('handles boundary at exactly 200 (Very High threshold)', () => {
    const result = calculateInherentRisk({ likelihoodScore: 10, impactScore: 20 });
    expect(result.inherentRiskScore).toBe(200);
    expect(result.rating).toBe(InherentRiskRating.VeryHigh);
  });
});
