import { describe, it, expect } from 'vitest';
import {
  scoreInterfaces,
  scoreTier,
  scoreChangeRequests,
  roundToNextMultipleOf5,
  scaleToStandardBand,
  calculateSingleSystemScore,
  calculateSystemComplexity,
} from './system-complexity.service.js';
import { SystemTier } from '../../types/enums.js';

describe('scoreInterfaces', () => {
  it('returns 5 for 0-3 interfaces', () => {
    expect(scoreInterfaces(0)).toBe(5);
    expect(scoreInterfaces(3)).toBe(5);
  });
  it('returns 10 for 4-9 interfaces', () => {
    expect(scoreInterfaces(4)).toBe(10);
    expect(scoreInterfaces(9)).toBe(10);
  });
  it('returns 15 for 10-15 interfaces', () => {
    expect(scoreInterfaces(10)).toBe(15);
    expect(scoreInterfaces(15)).toBe(15);
  });
  it('returns 20 for 16-24 interfaces', () => {
    expect(scoreInterfaces(16)).toBe(20);
    expect(scoreInterfaces(24)).toBe(20);
  });
  it('returns 25 for 25 interfaces (boundary)', () => {
    expect(scoreInterfaces(25)).toBe(20);
  });
  it('returns 25 for >25 interfaces', () => {
    expect(scoreInterfaces(26)).toBe(25);
    expect(scoreInterfaces(100)).toBe(25);
  });
});

describe('scoreTier', () => {
  it('returns 25 for Tier 0', () => expect(scoreTier(SystemTier.Tier0)).toBe(25));
  it('returns 20 for Tier 1', () => expect(scoreTier(SystemTier.Tier1)).toBe(20));
  it('returns 15 for Tier 2', () => expect(scoreTier(SystemTier.Tier2)).toBe(15));
  it('returns 5 for Tier 3', () => expect(scoreTier(SystemTier.Tier3)).toBe(5));
});

describe('scoreChangeRequests', () => {
  it('returns 5 for ≤5', () => {
    expect(scoreChangeRequests(0)).toBe(5);
    expect(scoreChangeRequests(5)).toBe(5);
  });
  it('returns 10 for >5 up to 10', () => {
    expect(scoreChangeRequests(6)).toBe(10);
    expect(scoreChangeRequests(10)).toBe(10);
  });
  it('returns 15 for >10 up to 20', () => {
    expect(scoreChangeRequests(11)).toBe(15);
    expect(scoreChangeRequests(20)).toBe(15);
  });
  it('returns 20 for >20 up to 30', () => {
    expect(scoreChangeRequests(21)).toBe(20);
    expect(scoreChangeRequests(30)).toBe(20);
  });
  it('returns 25 for >30', () => {
    expect(scoreChangeRequests(31)).toBe(25);
    expect(scoreChangeRequests(100)).toBe(25);
  });
});

describe('roundToNextMultipleOf5', () => {
  it('returns same value when already a multiple of 5', () => {
    expect(roundToNextMultipleOf5(5)).toBe(5);
    expect(roundToNextMultipleOf5(10)).toBe(10);
    expect(roundToNextMultipleOf5(15)).toBe(15);
    expect(roundToNextMultipleOf5(20)).toBe(20);
    expect(roundToNextMultipleOf5(25)).toBe(25);
  });
  it('rounds up fractional values', () => {
    expect(roundToNextMultipleOf5(10.1)).toBe(15);
    expect(roundToNextMultipleOf5(12.3)).toBe(15);
    expect(roundToNextMultipleOf5(6.67)).toBe(10);
    expect(roundToNextMultipleOf5(16.67)).toBe(20);
    expect(roundToNextMultipleOf5(21.5)).toBe(25);
  });
});

describe('scaleToStandardBand', () => {
  it('maps ≤5 → 5', () => expect(scaleToStandardBand(5)).toBe(5));
  it('maps >5 & <7.5 → 5', () => expect(scaleToStandardBand(6)).toBe(5));
  it('maps 7.5 → 10', () => expect(scaleToStandardBand(7.5)).toBe(10));
  it('maps 10 → 10', () => expect(scaleToStandardBand(10)).toBe(10));
  it('maps 12.5 → 15', () => expect(scaleToStandardBand(12.5)).toBe(15));
  it('maps 15 → 15', () => expect(scaleToStandardBand(15)).toBe(15));
  it('maps 17.5 → 20', () => expect(scaleToStandardBand(17.5)).toBe(20));
  it('maps 20 → 20', () => expect(scaleToStandardBand(20)).toBe(20));
  it('maps 22.5 → 25', () => expect(scaleToStandardBand(22.5)).toBe(25));
  it('maps 25 → 25', () => expect(scaleToStandardBand(25)).toBe(25));
});

describe('calculateSingleSystemScore', () => {
  it('computes weighted average and rounds to next multiple of 5', () => {
    const result = calculateSingleSystemScore({
      systemName: 'Core Banking',
      interfaceCount: 12,   // → 15
      tierCategory: SystemTier.Tier1, // → 20
      changeRequests: 8,    // → 10
    });
    expect(result.interfaceScore).toBe(15);
    expect(result.tierScore).toBe(20);
    expect(result.changeScore).toBe(10);
    // avg = (15+20+10)/3 = 15
    expect(result.weightedAvg).toBe(15);
    expect(result.finalScore).toBe(15);
  });

  it('rounds up non-integer averages', () => {
    const result = calculateSingleSystemScore({
      systemName: 'Payment Gateway',
      interfaceCount: 2,    // → 5
      tierCategory: SystemTier.Tier0, // → 25
      changeRequests: 3,    // → 5
    });
    expect(result.interfaceScore).toBe(5);
    expect(result.tierScore).toBe(25);
    expect(result.changeScore).toBe(5);
    // avg = (5+25+5)/3 ≈ 11.67
    expect(result.weightedAvg).toBeCloseTo(35 / 3);
    // ceil(11.67/5)*5 = ceil(2.33)*5 = 3*5 = 15
    expect(result.finalScore).toBe(15);
  });

  it('handles all-minimum scores', () => {
    const result = calculateSingleSystemScore({
      systemName: 'Simple System',
      interfaceCount: 0,
      tierCategory: SystemTier.Tier3,
      changeRequests: 0,
    });
    expect(result.weightedAvg).toBe(5);
    expect(result.finalScore).toBe(5);
  });

  it('handles all-maximum scores', () => {
    const result = calculateSingleSystemScore({
      systemName: 'Complex System',
      interfaceCount: 50,
      tierCategory: SystemTier.Tier0,
      changeRequests: 50,
    });
    expect(result.weightedAvg).toBe(25);
    expect(result.finalScore).toBe(25);
  });
});

describe('calculateSystemComplexity', () => {
  it('returns default score 5 for empty systems array', () => {
    const result = calculateSystemComplexity([]);
    expect(result.systems).toHaveLength(0);
    expect(result.averageScore).toBe(5);
    expect(result.scaledScore).toBe(5);
  });

  it('returns single system final score without scaling', () => {
    const result = calculateSystemComplexity([
      {
        systemName: 'Core Banking',
        interfaceCount: 12,
        tierCategory: SystemTier.Tier1,
        changeRequests: 8,
      },
    ]);
    expect(result.systems).toHaveLength(1);
    // finalScore = 15 (from single system test above)
    expect(result.averageScore).toBe(15);
    expect(result.scaledScore).toBe(15);
  });

  it('averages and scales multiple systems', () => {
    const result = calculateSystemComplexity([
      {
        systemName: 'System A',
        interfaceCount: 0,    // → 5
        tierCategory: SystemTier.Tier3, // → 5
        changeRequests: 0,    // → 5
        // avg=5, final=5
      },
      {
        systemName: 'System B',
        interfaceCount: 50,   // → 25
        tierCategory: SystemTier.Tier0, // → 25
        changeRequests: 50,   // → 25
        // avg=25, final=25
      },
    ]);
    expect(result.systems).toHaveLength(2);
    expect(result.systems[0].finalScore).toBe(5);
    expect(result.systems[1].finalScore).toBe(25);
    // average = (5+25)/2 = 15
    expect(result.averageScore).toBe(15);
    // 15 scales to 15
    expect(result.scaledScore).toBe(15);
  });

  it('scales multi-system average to correct band', () => {
    const result = calculateSystemComplexity([
      {
        systemName: 'System A',
        interfaceCount: 0,
        tierCategory: SystemTier.Tier3,
        changeRequests: 0,
        // final=5
      },
      {
        systemName: 'System B',
        interfaceCount: 5,    // → 10
        tierCategory: SystemTier.Tier2, // → 15
        changeRequests: 6,    // → 10
        // avg = (10+15+10)/3 ≈ 11.67, final = 15
      },
    ]);
    expect(result.systems[0].finalScore).toBe(5);
    expect(result.systems[1].finalScore).toBe(15);
    // average = (5+15)/2 = 10
    expect(result.averageScore).toBe(10);
    // 10 scales to 10
    expect(result.scaledScore).toBe(10);
  });

  it('handles three systems with varied scores', () => {
    const result = calculateSystemComplexity([
      {
        systemName: 'S1',
        interfaceCount: 2,    // → 5
        tierCategory: SystemTier.Tier3, // → 5
        changeRequests: 3,    // → 5
        // avg=5, final=5
      },
      {
        systemName: 'S2',
        interfaceCount: 12,   // → 15
        tierCategory: SystemTier.Tier1, // → 20
        changeRequests: 15,   // → 15
        // avg=50/3≈16.67, final=20
      },
      {
        systemName: 'S3',
        interfaceCount: 30,   // → 25
        tierCategory: SystemTier.Tier0, // → 25
        changeRequests: 35,   // → 25
        // avg=25, final=25
      },
    ]);
    expect(result.systems[0].finalScore).toBe(5);
    expect(result.systems[1].finalScore).toBe(20);
    expect(result.systems[2].finalScore).toBe(25);
    // average = (5+20+25)/3 ≈ 16.67
    expect(result.averageScore).toBeCloseTo(50 / 3);
    // 16.67 is ≥12.5 & <17.5 → 15
    expect(result.scaledScore).toBe(15);
  });
});
