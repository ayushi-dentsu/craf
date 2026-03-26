/**
 * Risk Calculator Orchestrator — full recalculation pipeline.
 *
 * Pipeline: likelihood → impact → IR → CQA → CQI → CPA → CPI → CER → RR → aggregation
 *
 * Implements score clamping for out-of-bounds values with warning logging.
 *
 * Requirements: 32.4
 */

import { calculateLikelihood, type LikelihoodInput, type LikelihoodResult } from './likelihood.service.js';
import { calculateImpact, type ImpactInput, type ImpactResult } from './impact.service.js';
import { calculateInherentRisk, type InherentRiskResult } from './inherent-risk.service.js';
import { calculateCQA, type CQAInput, type CQAResult } from './cqa.service.js';
import { calculateCQI, type CQIControlInput, type CQIResult } from './cqi.service.js';
import { calculateCPA, type CPAInput, type CPAResult } from './cpa.service.js';
import { calculateCPI, type CPIControlInput, type CPIResult } from './cpi.service.js';
import { calculateCER, type CERResult } from './cer.service.js';
import {
  calculateResidualRisk,
  aggregateResidualRisk,
  type ResidualRiskResult,
  type AggregationResult,
} from './residual-risk.service.js';
import { calculateSystemComplexity, type SystemComplexityInput, type SystemComplexityResult } from './system-complexity.service.js';
import { calculateProductComplexity, type ProductComplexityInput, type ProductComplexityResult } from './product-complexity.service.js';
import { calculateMateriality, type MaterialityInput, type MaterialityResult } from '../materiality.service.js';

/** Warnings collected during a recalculation run. */
export interface RecalculationWarning {
  field: string;
  message: string;
  originalValue: number;
  clampedValue: number;
}

/**
 * Full recalculation pipeline input for an AU.
 */
export interface FullRecalculationInput {
  likelihood: LikelihoodInput;
  impact: ImpactInput;
  controls: {
    cqa: CQAInput;
    cpa: CPAInput;
  }[];
  /** Number of obligations without any control (for CQI/CPI "No Control" category) */
  obligationsWithoutControl: number;
}

/**
 * Full recalculation pipeline result for an AU.
 */
export interface FullRecalculationResult {
  likelihood: LikelihoodResult;
  impact: ImpactResult;
  inherentRisk: InherentRiskResult;
  controlResults: {
    cqa: CQAResult;
    cpa: CPAResult;
    residualRisk: ResidualRiskResult;
  }[];
  cqi: CQIResult;
  cpi: CPIResult;
  cer: CERResult;
  aggregation: AggregationResult;
  warnings: RecalculationWarning[];
}

/**
 * Clamps a score to a valid range and logs a warning if out of bounds.
 */
function clampScore(
  value: number,
  min: number,
  max: number,
  field: string,
  warnings: RecalculationWarning[],
): number {
  if (value < min) {
    warnings.push({ field, message: `Value ${value} below minimum ${min}, clamped`, originalValue: value, clampedValue: min });
    return min;
  }
  if (value > max) {
    warnings.push({ field, message: `Value ${value} above maximum ${max}, clamped`, originalValue: value, clampedValue: max });
    return max;
  }
  return value;
}

/**
 * Runs the full CRAF recalculation pipeline for an AU.
 * Req 32.4: Full pipeline with score clamping and warning logging.
 */
export function runFullRecalculation(input: FullRecalculationInput): FullRecalculationResult {
  const warnings: RecalculationWarning[] = [];

  // Step 1: Likelihood
  const likelihood = calculateLikelihood(input.likelihood);
  const likelihoodScore = clampScore(likelihood.scaledScore, 5, 25, 'likelihoodScore', warnings);

  // Step 2: Impact
  const impact = calculateImpact(input.impact);
  const impactScore = clampScore(impact.overallScore, 5, 25, 'impactScore', warnings);

  // Step 3: Inherent Risk
  const inherentRisk = calculateInherentRisk({ likelihoodScore, impactScore });

  // Step 4-5: CQA for each control → CQI
  const cqaResults = input.controls.map((c) => calculateCQA(c.cqa));
  const cqiControls: CQIControlInput[] = [
    ...cqaResults.map((r) => ({ cqaRawScore: r.rawScore as number | null })),
    ...Array.from({ length: input.obligationsWithoutControl }, () => ({ cqaRawScore: null as number | null })),
  ];
  const cqi = calculateCQI(cqiControls);

  // Step 6-7: CPA for each control → CPI
  const cpaResults = input.controls.map((c) => calculateCPA(c.cpa));
  const cpiControls: CPIControlInput[] = [
    ...cpaResults.map((r) => ({ cpaRawScore: r.rawScore as number | null })),
    ...Array.from({ length: input.obligationsWithoutControl }, () => ({ cpaRawScore: null as number | null })),
  ];
  const cpi = calculateCPI(cpiControls);

  // Step 8: CER
  const cer = calculateCER({ cqiInterpScore: cqi.interpScore, cpiInterpScore: cpi.interpScore });

  // Step 9: Residual Risk per control
  const controlResults = input.controls.map((_, i) => ({
    cqa: cqaResults[i],
    cpa: cpaResults[i],
    residualRisk: calculateResidualRisk({
      inherentRiskScore: inherentRisk.inherentRiskScore,
      cerScore: cer.cerScore,
    }),
  }));

  // Step 10: Aggregation
  const allRatings = [
    ...controlResults.map((c) => c.residualRisk.rating),
    ...Array.from({ length: input.obligationsWithoutControl }, () =>
      calculateResidualRisk({ inherentRiskScore: inherentRisk.inherentRiskScore, cerScore: 0 }).rating
    ),
  ];
  const aggregation = aggregateResidualRisk({ ratings: allRatings });

  return {
    likelihood,
    impact,
    inherentRisk,
    controlResults,
    cqi,
    cpi,
    cer,
    aggregation,
    warnings,
  };
}

// Re-export all services for convenient access
export { calculateLikelihood, type LikelihoodInput, type LikelihoodResult } from './likelihood.service.js';
export { calculateImpact, type ImpactInput, type ImpactResult } from './impact.service.js';
export { calculateInherentRisk, type InherentRiskInput, type InherentRiskResult } from './inherent-risk.service.js';
export { calculateCQA, scaleCQA, mapCQACategory, type CQAInput, type CQAResult } from './cqa.service.js';
export { calculateCQI, interpretCQI, type CQIControlInput, type CQIResult } from './cqi.service.js';
export { calculateCPA, scoreKCISelfAssessment, scoreControlTesting, scaleCPA, type CPAInput, type CPAResult } from './cpa.service.js';
export { calculateCPI, interpretCPI, type CPIControlInput, type CPIResult } from './cpi.service.js';
export { calculateCER, mapCERRating, type CERInput, type CERResult } from './cer.service.js';
export {
  calculateResidualRisk,
  aggregateResidualRisk,
  mapResidualRiskRating,
  mapAggregateRating,
  type ResidualRiskInput,
  type ResidualRiskResult,
  type AggregationResult,
} from './residual-risk.service.js';
export { calculateSystemComplexity, type SystemComplexityInput, type SystemComplexityResult } from './system-complexity.service.js';
export { calculateProductComplexity, type ProductComplexityInput, type ProductComplexityResult } from './product-complexity.service.js';
export { calculateMateriality, type MaterialityInput, type MaterialityResult } from '../materiality.service.js';
