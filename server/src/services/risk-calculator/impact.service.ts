/**
 * Impact scoring service for CRAF risk assessment.
 *
 * Evaluates 4 parameters at the cluster level:
 *   1. Business impact (5 bands: 5/10/15/20/25)
 *   2. Media coverage / reputational impact (4 bands: 5/10/15/20)
 *   3. Financial penalty (2 values: 5 or 25)
 *   4. G/L impact (3 values: 15/20/25)
 *
 * Overall impact = max of the four parameter scores.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */

/**
 * Input parameters for impact calculation at the cluster level.
 * Each field is a pre-scored value from the respective band.
 */
export interface ImpactInput {
  /** Business impact score: 5, 10, 15, 20, or 25 */
  businessImpact: number;
  /** Media coverage / reputational impact score: 5, 10, 15, or 20 */
  mediaImpact: number;
  /** Financial penalty score: 5 or 25 */
  financialPenalty: number;
  /** G/L impact score: 15, 20, or 25 */
  glImpact: number;
}

/**
 * Result of the impact calculation.
 */
export interface ImpactResult {
  parameterScores: {
    businessImpact: number;
    mediaImpact: number;
    financialPenalty: number;
    glImpact: number;
  };
  overallScore: number;
}

/**
 * Valid business impact scores mapped from descriptive bands.
 * Req 5.2:
 *   25 — complete closure of branch/business
 *   20 — closure exceeding 1 year
 *   15 — closure exceeding 6 months up to 1 year
 *   10 — closure exceeding 3 months up to 6 months
 *    5 — no closure
 */
const VALID_BUSINESS_IMPACT_SCORES = [5, 10, 15, 20, 25] as const;

/**
 * Valid media coverage scores.
 * Req 5.3:
 *   20 — Very High reputational impact
 *   15 — High
 *   10 — Moderate
 *    5 — Low
 */
const VALID_MEDIA_IMPACT_SCORES = [5, 10, 15, 20] as const;

/**
 * Valid financial penalty scores.
 * Req 5.4:
 *   25 — penalty levied to the AU
 *    5 — no penalty levied
 */
const VALID_FINANCIAL_PENALTY_SCORES = [5, 25] as const;

/**
 * Valid G/L impact scores.
 * Req 5.5:
 *   25 — Significantly High financial reporting impact
 *   20 — High
 *   15 — Medium
 */
const VALID_GL_IMPACT_SCORES = [15, 20, 25] as const;

/**
 * Validates that a business impact score is within the allowed set.
 * Req 5.2
 */
export function isValidBusinessImpact(score: number): boolean {
  return (VALID_BUSINESS_IMPACT_SCORES as readonly number[]).includes(score);
}

/**
 * Validates that a media impact score is within the allowed set.
 * Req 5.3
 */
export function isValidMediaImpact(score: number): boolean {
  return (VALID_MEDIA_IMPACT_SCORES as readonly number[]).includes(score);
}

/**
 * Validates that a financial penalty score is within the allowed set.
 * Req 5.4
 */
export function isValidFinancialPenalty(score: number): boolean {
  return (VALID_FINANCIAL_PENALTY_SCORES as readonly number[]).includes(score);
}

/**
 * Validates that a G/L impact score is within the allowed set.
 * Req 5.5
 */
export function isValidGlImpact(score: number): boolean {
  return (VALID_GL_IMPACT_SCORES as readonly number[]).includes(score);
}

/**
 * Calculates the overall impact score for a cluster.
 * Req 5.1: Evaluates all 4 parameters.
 * Req 5.6: Overall impact = max of the four parameter scores.
 */
export function calculateImpact(input: ImpactInput): ImpactResult {
  const { businessImpact, mediaImpact, financialPenalty, glImpact } = input;

  const overallScore = Math.max(businessImpact, mediaImpact, financialPenalty, glImpact);

  return {
    parameterScores: {
      businessImpact,
      mediaImpact,
      financialPenalty,
      glImpact,
    },
    overallScore,
  };
}
