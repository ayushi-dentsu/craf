import { describe, it, expect } from 'vitest';
import {
  calculateImpact,
  isValidBusinessImpact,
  isValidMediaImpact,
  isValidFinancialPenalty,
  isValidGlImpact,
  type ImpactInput,
} from './impact.service.js';

describe('isValidBusinessImpact', () => {
  it('accepts valid scores: 5, 10, 15, 20, 25', () => {
    expect(isValidBusinessImpact(5)).toBe(true);
    expect(isValidBusinessImpact(10)).toBe(true);
    expect(isValidBusinessImpact(15)).toBe(true);
    expect(isValidBusinessImpact(20)).toBe(true);
    expect(isValidBusinessImpact(25)).toBe(true);
  });
  it('rejects invalid scores', () => {
    expect(isValidBusinessImpact(0)).toBe(false);
    expect(isValidBusinessImpact(7)).toBe(false);
    expect(isValidBusinessImpact(30)).toBe(false);
  });
});

describe('isValidMediaImpact', () => {
  it('accepts valid scores: 5, 10, 15, 20', () => {
    expect(isValidMediaImpact(5)).toBe(true);
    expect(isValidMediaImpact(10)).toBe(true);
    expect(isValidMediaImpact(15)).toBe(true);
    expect(isValidMediaImpact(20)).toBe(true);
  });
  it('rejects 25 (not a valid media impact score)', () => {
    expect(isValidMediaImpact(25)).toBe(false);
  });
  it('rejects invalid scores', () => {
    expect(isValidMediaImpact(0)).toBe(false);
    expect(isValidMediaImpact(12)).toBe(false);
  });
});

describe('isValidFinancialPenalty', () => {
  it('accepts 5 (no penalty) and 25 (penalty levied)', () => {
    expect(isValidFinancialPenalty(5)).toBe(true);
    expect(isValidFinancialPenalty(25)).toBe(true);
  });
  it('rejects other values', () => {
    expect(isValidFinancialPenalty(10)).toBe(false);
    expect(isValidFinancialPenalty(15)).toBe(false);
    expect(isValidFinancialPenalty(20)).toBe(false);
    expect(isValidFinancialPenalty(0)).toBe(false);
  });
});

describe('isValidGlImpact', () => {
  it('accepts valid scores: 15, 20, 25', () => {
    expect(isValidGlImpact(15)).toBe(true);
    expect(isValidGlImpact(20)).toBe(true);
    expect(isValidGlImpact(25)).toBe(true);
  });
  it('rejects scores below 15', () => {
    expect(isValidGlImpact(5)).toBe(false);
    expect(isValidGlImpact(10)).toBe(false);
  });
  it('rejects invalid scores', () => {
    expect(isValidGlImpact(0)).toBe(false);
    expect(isValidGlImpact(30)).toBe(false);
  });
});

describe('calculateImpact', () => {
  it('returns max of all four parameters (Req 5.6)', () => {
    const input: ImpactInput = {
      businessImpact: 25,
      mediaImpact: 15,
      financialPenalty: 5,
      glImpact: 20,
    };
    const result = calculateImpact(input);
    expect(result.overallScore).toBe(25);
  });

  it('returns correct parameter scores in result', () => {
    const input: ImpactInput = {
      businessImpact: 10,
      mediaImpact: 20,
      financialPenalty: 25,
      glImpact: 15,
    };
    const result = calculateImpact(input);
    expect(result.parameterScores.businessImpact).toBe(10);
    expect(result.parameterScores.mediaImpact).toBe(20);
    expect(result.parameterScores.financialPenalty).toBe(25);
    expect(result.parameterScores.glImpact).toBe(15);
    expect(result.overallScore).toBe(25);
  });

  it('handles all minimum scores', () => {
    const input: ImpactInput = {
      businessImpact: 5,
      mediaImpact: 5,
      financialPenalty: 5,
      glImpact: 15, // GL minimum is 15
    };
    const result = calculateImpact(input);
    expect(result.overallScore).toBe(15);
  });

  it('handles all maximum scores', () => {
    const input: ImpactInput = {
      businessImpact: 25,
      mediaImpact: 20,
      financialPenalty: 25,
      glImpact: 25,
    };
    const result = calculateImpact(input);
    expect(result.overallScore).toBe(25);
  });

  it('picks businessImpact when it is the highest', () => {
    const result = calculateImpact({
      businessImpact: 20,
      mediaImpact: 10,
      financialPenalty: 5,
      glImpact: 15,
    });
    expect(result.overallScore).toBe(20);
  });

  it('picks mediaImpact when it is the highest', () => {
    const result = calculateImpact({
      businessImpact: 5,
      mediaImpact: 20,
      financialPenalty: 5,
      glImpact: 15,
    });
    expect(result.overallScore).toBe(20);
  });

  it('picks financialPenalty when it is the highest', () => {
    const result = calculateImpact({
      businessImpact: 10,
      mediaImpact: 10,
      financialPenalty: 25,
      glImpact: 20,
    });
    expect(result.overallScore).toBe(25);
  });

  it('picks glImpact when it is the highest', () => {
    const result = calculateImpact({
      businessImpact: 5,
      mediaImpact: 5,
      financialPenalty: 5,
      glImpact: 25,
    });
    expect(result.overallScore).toBe(25);
  });

  it('handles ties correctly (max still works)', () => {
    const result = calculateImpact({
      businessImpact: 20,
      mediaImpact: 20,
      financialPenalty: 5,
      glImpact: 20,
    });
    expect(result.overallScore).toBe(20);
  });
});
