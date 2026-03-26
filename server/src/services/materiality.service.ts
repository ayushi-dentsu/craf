/**
 * Materiality Assessment service for CRAF ICOFR.
 *
 * Revenue materiality = PBT × 0.05
 * Balance sheet materiality = totalAssets × 0.005
 * Final = computed × (1 − haircut/100)
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */

/**
 * Input for materiality calculation.
 */
export interface MaterialityInput {
  /** Profit Before Tax of the standalone bank */
  profitBeforeTax: number;
  /** Total assets of the standalone bank */
  totalAssets: number;
  /** Haircut percentage (default 25%) */
  haircutPercent?: number;
  /** Tolerable error threshold (optional, bank-configurable) */
  tolerableError?: number;
}

/**
 * Result of materiality calculation.
 */
export interface MaterialityResult {
  /** Revenue materiality before haircut: PBT × 5% */
  revenueMateriality: number;
  /** Balance sheet materiality before haircut: totalAssets × 0.5% */
  balanceSheetMateriality: number;
  /** Haircut percentage applied */
  haircutPercent: number;
  /** Final revenue materiality after haircut */
  finalRevenueMateriality: number;
  /** Final balance sheet materiality after haircut */
  finalBSMateriality: number;
  /** Tolerable error if configured */
  tolerableError: number | null;
}

/**
 * Calculates materiality assessment.
 * Req 9.1: Revenue materiality = 5% of PBT
 * Req 9.2: BS materiality = 0.5% of total assets
 * Req 9.3: Apply 25% haircut (configurable)
 * Req 9.4: Support tolerable error configuration
 */
export function calculateMateriality(input: MaterialityInput): MaterialityResult {
  const haircutPercent = input.haircutPercent ?? 25;

  const revenueMateriality = input.profitBeforeTax * 0.05;
  const balanceSheetMateriality = input.totalAssets * 0.005;

  const haircutMultiplier = 1 - haircutPercent / 100;
  const finalRevenueMateriality = revenueMateriality * haircutMultiplier;
  const finalBSMateriality = balanceSheetMateriality * haircutMultiplier;

  return {
    revenueMateriality,
    balanceSheetMateriality,
    haircutPercent,
    finalRevenueMateriality,
    finalBSMateriality,
    tolerableError: input.tolerableError ?? null,
  };
}
