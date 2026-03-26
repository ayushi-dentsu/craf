/**
 * Scenario seed data for CRAF demo scenarios.
 *
 * Since there is no dedicated scenario table in the Prisma schema, this module
 * exports pre-computed scenario data as JSON objects that the API can serve
 * directly. All values are computed through the real calculation engine for
 * mathematical consistency (Req 27.6).
 *
 * Scenario 1: Audit Finding Remediation (Trade Finance — AU028)
 * Scenario 2: Control Failure Investigation (Liabilities Ops — AU006)
 * Scenario 3: New Regulation Impact Assessment (Digital Lending — AU004, AU003, AU001)
 *
 * Requirements: 24.1, 24.2, 24.3, 24.4, 25.1, 25.2, 25.3, 25.4, 26.1, 26.2, 26.3, 26.4
 */
import { PrismaClient, AssessmentUnit } from '@prisma/client';
import {
  calculateCQA,
  calculateCQI,
  calculateCPA,
  calculateCPI,
  calculateCER,
  calculateResidualRisk,
  aggregateResidualRisk,
  type CPAInput,
  type CQIControlInput,
  type CPIControlInput,
} from '../risk-calculator/index.js';
import {
  ControlRiskType,
  KCIResult,
  SelfAssessmentResult,
  ControlTestingResult,
  ResidualRiskRating,
} from '../../types/enums.js';

// ── Exported scenario data store ──────────────────────────────────────────

export interface ScenarioBeforeAfter {
  scenarioId: string;
  title: string;
  description: string;
  auCode: string;
  auName: string;
  before: ScenarioMetrics;
  after: ScenarioMetrics;
}

export interface ScenarioMetrics {
  inherentRiskScore: number;
  inherentRiskRating: string;
  cqiScore: number;
  cqiInterpScore: number;
  cpiScore: number;
  cpiInterpScore: number;
  cerScore: number;
  cerRating: string;
  residualRiskScore: number;
  residualRiskRating: string;
  aggregateResidual: number;
  aggregateRating: string;
}

export interface DegradationPoint {
  month: string;
  cpaRawScore: number;
  cpaScaledScore: number;
  cpiScore: number;
  cpiInterpScore: number;
  cerScore: number;
  residualRiskScore: number;
  residualRiskRating: string;
}

export interface ControlDegradationScenario {
  scenarioId: string;
  title: string;
  description: string;
  auCode: string;
  auName: string;
  controlCode: string;
  controlName: string;
  degradationPattern: DegradationPoint[];
}

export interface WhatIfScenarioOutcome {
  scenarioLabel: string;
  description: string;
  newObligationCount: number;
  controlStrategy: string;
  cqiScore: number;
  cpiScore: number;
  cerScore: number;
  cerRating: string;
  residualRiskScore: number;
  residualRiskRating: string;
  aggregateResidual: number;
  aggregateRating: string;
}

export interface WhatIfAU {
  auCode: string;
  auName: string;
  currentInherentRiskScore: number;
  newObligationCount: number;
  scenarios: WhatIfScenarioOutcome[];
}

export interface WhatIfRegulationScenario {
  scenarioId: string;
  title: string;
  description: string;
  regulationName: string;
  totalNewObligations: number;
  affectedAUs: WhatIfAU[];
}

export interface AllScenarioData {
  scenario1: ScenarioBeforeAfter;
  scenario2: ControlDegradationScenario;
  scenario3: WhatIfRegulationScenario;
}

/** Global store populated during seeding, accessible by the API layer. */
let _scenarioData: AllScenarioData | null = null;

export function getScenarioData(): AllScenarioData | null {
  return _scenarioData;
}


// ── Scenario 1: Audit Finding Remediation (AU028 — Trade Finance) ─────────

function buildScenario1(
  au028: AssessmentUnit,
  existingCQAScores: number[],
  existingCPAScores: number[],
  inherentRiskScore: number,
  inherentRiskRating: string,
): ScenarioBeforeAfter {
  // --- "Before" state: CTL073 has CQA raw = 1 (deficient) ---
  // The existing seed data already has this. We reconstruct the metrics from
  // the raw scores that risk-data.seed.ts produced.
  const beforeCQIInputs: CQIControlInput[] = existingCQAScores.map((s) => ({ cqaRawScore: s }));
  const beforeCQI = calculateCQI(beforeCQIInputs);

  const beforeCPIInputs: CPIControlInput[] = existingCPAScores.map((s) => ({ cpaRawScore: s }));
  const beforeCPI = calculateCPI(beforeCPIInputs);

  const beforeCER = calculateCER({
    cqiInterpScore: beforeCQI.interpScore,
    cpiInterpScore: beforeCPI.interpScore,
  });

  const beforeRR = calculateResidualRisk({
    inherentRiskScore,
    cerScore: beforeCER.cerScore,
  });

  const beforeRatings: ResidualRiskRating[] = existingCQAScores.map(() => beforeRR.rating);
  const beforeAgg = aggregateResidualRisk({ ratings: beforeRatings });

  // --- "After" state: CTL073 upgraded to CQA raw = 625 ---
  // Replace the deficient control's CQA score (raw=1) with the remediated value (raw=625)
  const afterCQAScores = existingCQAScores.map((s) => (s === 1 ? 625 : s));
  const afterCQIInputs: CQIControlInput[] = afterCQAScores.map((s) => ({ cqaRawScore: s }));
  const afterCQI = calculateCQI(afterCQIInputs);

  // After remediation, CPA also improves for the remediated control
  const afterCPAScores = existingCPAScores.map((s, i) =>
    existingCQAScores[i] === 1 ? 25 : s,
  );
  const afterCPIInputs: CPIControlInput[] = afterCPAScores.map((s) => ({ cpaRawScore: s }));
  const afterCPI = calculateCPI(afterCPIInputs);

  const afterCER = calculateCER({
    cqiInterpScore: afterCQI.interpScore,
    cpiInterpScore: afterCPI.interpScore,
  });

  const afterRR = calculateResidualRisk({
    inherentRiskScore,
    cerScore: afterCER.cerScore,
  });

  const afterRatings: ResidualRiskRating[] = afterCQAScores.map(() => afterRR.rating);
  const afterAgg = aggregateResidualRisk({ ratings: afterRatings });

  return {
    scenarioId: 'scenario-1-audit-remediation',
    title: 'Audit Finding Remediation',
    description:
      'Trade Finance Operations Group (AU028): LC Issuance Maker-Checker control (CTL073) upgraded from manual/undocumented to IT-driven/automated/documented.',
    auCode: 'AU028',
    auName: au028.name,
    before: {
      inherentRiskScore,
      inherentRiskRating,
      cqiScore: Math.round(beforeCQI.cqiScore * 10000) / 10000,
      cqiInterpScore: beforeCQI.interpScore,
      cpiScore: Math.round(beforeCPI.cpiScore * 10000) / 10000,
      cpiInterpScore: beforeCPI.interpScore,
      cerScore: beforeCER.cerScore,
      cerRating: beforeCER.rating,
      residualRiskScore: Math.round(beforeRR.residualRiskScore * 10000) / 10000,
      residualRiskRating: beforeRR.rating,
      aggregateResidual: Math.round(beforeAgg.aggregateResidual * 10000) / 10000,
      aggregateRating: beforeAgg.aggregateRating,
    },
    after: {
      inherentRiskScore,
      inherentRiskRating,
      cqiScore: Math.round(afterCQI.cqiScore * 10000) / 10000,
      cqiInterpScore: afterCQI.interpScore,
      cpiScore: Math.round(afterCPI.cpiScore * 10000) / 10000,
      cpiInterpScore: afterCPI.interpScore,
      cerScore: afterCER.cerScore,
      cerRating: afterCER.rating,
      residualRiskScore: Math.round(afterRR.residualRiskScore * 10000) / 10000,
      residualRiskRating: afterRR.rating,
      aggregateResidual: Math.round(afterAgg.aggregateResidual * 10000) / 10000,
      aggregateRating: afterAgg.aggregateRating,
    },
  };
}


// ── Scenario 2: Control Failure Investigation (AU006 — Liabilities Ops) ───

function buildScenario2(
  au006: AssessmentUnit,
  inherentRiskScore: number,
  cqiInterpScore: number,
): ControlDegradationScenario {
  // Simulate a 3-month CPA degradation pattern for CTL022 (Daily Cash Reconciliation).
  // Month 1: CPA still good (raw=25), Month 2: partial degradation (raw=5), Month 3: full failure (raw=1).
  const degradationSteps: Array<{
    month: string;
    kciResult: KCIResult;
    saResult: SelfAssessmentResult;
    testResult: ControlTestingResult;
  }> = [
    {
      month: 'Month 1 (Oct 2024)',
      kciResult: KCIResult.Pass,
      saResult: SelfAssessmentResult.Pass,
      testResult: ControlTestingResult.Pass,
    },
    {
      month: 'Month 2 (Nov 2024)',
      kciResult: KCIResult.Fail,
      saResult: SelfAssessmentResult.Pass,
      testResult: ControlTestingResult.PassWithException,
    },
    {
      month: 'Month 3 (Dec 2024)',
      kciResult: KCIResult.Fail,
      saResult: SelfAssessmentResult.Fail,
      testResult: ControlTestingResult.Fail,
    },
  ];

  const degradationPattern: DegradationPoint[] = degradationSteps.map((step) => {
    const cpaInput: CPAInput = {
      controlRiskType: ControlRiskType.Compliance,
      kciLinked: true,
      kciResult: step.kciResult,
      selfAssessmentResult: step.saResult,
      controlTestingResult: step.testResult,
    };
    const cpa = calculateCPA(cpaInput);

    // Compute CPI with this single control's CPA as the representative
    const cpiInputs: CPIControlInput[] = [{ cpaRawScore: cpa.rawScore }];
    const cpi = calculateCPI(cpiInputs);

    const cer = calculateCER({
      cqiInterpScore,
      cpiInterpScore: cpi.interpScore,
    });

    const rr = calculateResidualRisk({
      inherentRiskScore,
      cerScore: cer.cerScore,
    });

    return {
      month: step.month,
      cpaRawScore: cpa.rawScore,
      cpaScaledScore: cpa.scaledScore,
      cpiScore: Math.round(cpi.cpiScore * 10000) / 10000,
      cpiInterpScore: cpi.interpScore,
      cerScore: cer.cerScore,
      residualRiskScore: Math.round(rr.residualRiskScore * 10000) / 10000,
      residualRiskRating: rr.rating,
    };
  });

  return {
    scenarioId: 'scenario-2-control-failure',
    title: 'Control Failure Investigation',
    description:
      'Liabilities Operations Group (AU006): Daily Cash Reconciliation control (CTL022) shows progressive CPA degradation over 3 months, triggering early warning.',
    auCode: 'AU006',
    auName: au006.name,
    controlCode: 'CTL022',
    controlName: 'Daily Cash Reconciliation',
    degradationPattern,
  };
}


// ── Scenario 3: New Regulation Impact (Digital Lending) ───────────────────

interface WhatIfAUConfig {
  auCode: string;
  newObligationCount: number;
}

function buildScenario3(
  assessmentUnits: AssessmentUnit[],
  auInherentRisks: Map<string, number>,
): WhatIfRegulationScenario {
  const auConfigs: WhatIfAUConfig[] = [
    { auCode: 'AU004', newObligationCount: 5 },
    { auCode: 'AU003', newObligationCount: 3 },
    { auCode: 'AU001', newObligationCount: 7 },
  ];

  const affectedAUs: WhatIfAU[] = auConfigs.map((cfg) => {
    const au = assessmentUnits.find((a) => a.code === cfg.auCode);
    const irScore = auInherentRisks.get(cfg.auCode) ?? 200;

    // Scenario A: No controls — all new obligations have no control
    const scenarioA = buildWhatIfOutcome(
      'Scenario A',
      'No new controls implemented',
      cfg.newObligationCount,
      'none',
      irScore,
      cfg.newObligationCount,
    );

    // Scenario B: Basic controls — manual, detective, undocumented
    const scenarioB = buildWhatIfOutcome(
      'Scenario B',
      'Basic manual controls for each obligation',
      cfg.newObligationCount,
      'basic',
      irScore,
      cfg.newObligationCount,
    );

    // Scenario C: Comprehensive controls — IT-driven, preventive, documented
    const scenarioC = buildWhatIfOutcome(
      'Scenario C',
      'Comprehensive IT-driven controls for each obligation',
      cfg.newObligationCount,
      'comprehensive',
      irScore,
      cfg.newObligationCount,
    );

    return {
      auCode: cfg.auCode,
      auName: au?.name ?? cfg.auCode,
      currentInherentRiskScore: irScore,
      newObligationCount: cfg.newObligationCount,
      scenarios: [scenarioA, scenarioB, scenarioC],
    };
  });

  return {
    scenarioId: 'scenario-3-new-regulation',
    title: 'New Regulation Impact Assessment',
    description:
      'RBI Master Direction on Digital Lending: assess impact of 15 new compliance obligations across 3 AUs with varying control strategies.',
    regulationName: 'RBI Master Direction on Digital Lending',
    totalNewObligations: 15,
    affectedAUs,
  };
}

function buildWhatIfOutcome(
  label: string,
  description: string,
  obligationCount: number,
  strategy: 'none' | 'basic' | 'comprehensive',
  inherentRiskScore: number,
  controlCount: number,
): WhatIfScenarioOutcome {
  let cqaInputs: CQIControlInput[];
  let cpaInputs: CPIControlInput[];

  if (strategy === 'none') {
    // No controls: all obligations have null CQA/CPA
    cqaInputs = Array.from({ length: controlCount }, () => ({ cqaRawScore: null }));
    cpaInputs = Array.from({ length: controlCount }, () => ({ cpaRawScore: null }));
  } else if (strategy === 'basic') {
    // Basic: manual (1), manual monitoring (1), detective at lower freq (1), undocumented (1)
    // CQA raw = 1×1×1×1 = 1
    const basicCQA = calculateCQA({ monitoringScore: 1, automationScore: 1, typeScore: 1, documentationScore: 1 });
    // CPA: KCI not linked, SA pass, testing pass with exception → raw = 3×3 = 9
    const basicCPA = calculateCPA({
      controlRiskType: ControlRiskType.Compliance,
      kciLinked: false,
      kciResult: null,
      selfAssessmentResult: SelfAssessmentResult.Pass,
      controlTestingResult: ControlTestingResult.PassWithException,
    });
    cqaInputs = Array.from({ length: controlCount }, () => ({ cqaRawScore: basicCQA.rawScore }));
    cpaInputs = Array.from({ length: controlCount }, () => ({ cpaRawScore: basicCPA.rawScore }));
  } else {
    // Comprehensive: IT-driven (5), MRC+IT (5), preventive (5), documented (5)
    // CQA raw = 5×5×5×5 = 625
    const compCQA = calculateCQA({ monitoringScore: 5, automationScore: 5, typeScore: 5, documentationScore: 5 });
    // CPA: KCI linked, pass, SA pass, testing pass → raw = 5×5 = 25
    const compCPA = calculateCPA({
      controlRiskType: ControlRiskType.Compliance,
      kciLinked: true,
      kciResult: KCIResult.Pass,
      selfAssessmentResult: SelfAssessmentResult.Pass,
      controlTestingResult: ControlTestingResult.Pass,
    });
    cqaInputs = Array.from({ length: controlCount }, () => ({ cqaRawScore: compCQA.rawScore }));
    cpaInputs = Array.from({ length: controlCount }, () => ({ cpaRawScore: compCPA.rawScore }));
  }

  const cqi = calculateCQI(cqaInputs);
  const cpi = calculateCPI(cpaInputs);
  const cer = calculateCER({ cqiInterpScore: cqi.interpScore, cpiInterpScore: cpi.interpScore });
  const rr = calculateResidualRisk({ inherentRiskScore, cerScore: cer.cerScore });

  const ratings: ResidualRiskRating[] = cqaInputs.map((input) =>
    input.cqaRawScore === null ? ResidualRiskRating.NoControl : rr.rating,
  );
  const agg = aggregateResidualRisk({ ratings });

  return {
    scenarioLabel: label,
    description,
    newObligationCount: obligationCount,
    controlStrategy: strategy,
    cqiScore: Math.round(cqi.cqiScore * 10000) / 10000,
    cpiScore: Math.round(cpi.cpiScore * 10000) / 10000,
    cerScore: cer.cerScore,
    cerRating: cer.rating,
    residualRiskScore: Math.round(rr.residualRiskScore * 10000) / 10000,
    residualRiskRating: rr.rating,
    aggregateResidual: Math.round(agg.aggregateResidual * 10000) / 10000,
    aggregateRating: agg.aggregateRating,
  };
}


// ── Main seed function ────────────────────────────────────────────────────

export async function seedScenarioData(
  prisma: PrismaClient,
  assessmentUnits: AssessmentUnit[],
): Promise<void> {
  // Find the current period
  const currentPeriod = await prisma.assessmentPeriod.findFirst({
    where: { isCurrent: true },
  });
  if (!currentPeriod) {
    console.warn('  ⚠ No current assessment period found — skipping scenario data.');
    return;
  }

  const auByCode = new Map(assessmentUnits.map((au) => [au.code, au]));

  // ── Scenario 1: Gather AU028 data ──────────────────────────────────────

  const au028 = auByCode.get('AU028');
  if (!au028) {
    console.warn('  ⚠ AU028 not found — skipping Scenario 1.');
  }

  let scenario1: ScenarioBeforeAfter | null = null;
  if (au028) {
    // Fetch inherent risk for AU028
    const ir028 = await prisma.inherentRisk.findUnique({
      where: { auId_periodId: { auId: au028.id, periodId: currentPeriod.id } },
    });

    // Fetch all controls for AU028 via obligations
    const obligations028 = await prisma.complianceObligation.findMany({
      where: { auId: au028.id },
      include: { controls: true },
    });
    const controls028 = obligations028.flatMap((o) => o.controls);

    // Fetch CQA and CPA raw scores for these controls in the current period
    const cqaRecords = await prisma.controlQuality.findMany({
      where: {
        controlId: { in: controls028.map((c) => c.id) },
        periodId: currentPeriod.id,
      },
    });
    const cpaRecords = await prisma.controlPerformance.findMany({
      where: {
        controlId: { in: controls028.map((c) => c.id) },
        periodId: currentPeriod.id,
      },
    });

    const cqaByCtrl = new Map(cqaRecords.map((r) => [r.controlId, r.cqaRawScore]));
    const cpaByCtrl = new Map(cpaRecords.map((r) => [r.controlId, r.cpaRawScore]));

    const cqaScores = controls028.map((c) => cqaByCtrl.get(c.id) ?? 1);
    const cpaScores = controls028.map((c) => cpaByCtrl.get(c.id) ?? 1);

    scenario1 = buildScenario1(
      au028,
      cqaScores,
      cpaScores,
      ir028?.inherentRiskScore ?? 300,
      ir028?.inherentRiskRating ?? 'Very High',
    );
    console.log('  ✓ Built Scenario 1: Audit Finding Remediation (AU028)');
  }

  // ── Scenario 2: Gather AU006 data ──────────────────────────────────────

  const au006 = auByCode.get('AU006');
  if (!au006) {
    console.warn('  ⚠ AU006 not found — skipping Scenario 2.');
  }

  let scenario2: ControlDegradationScenario | null = null;
  if (au006) {
    const ir006 = await prisma.inherentRisk.findUnique({
      where: { auId_periodId: { auId: au006.id, periodId: currentPeriod.id } },
    });
    const cer006 = await prisma.controlEnvironmentRating.findUnique({
      where: { auId_periodId: { auId: au006.id, periodId: currentPeriod.id } },
    });

    scenario2 = buildScenario2(
      au006,
      ir006?.inherentRiskScore ?? 100,
      cer006?.cqiInterpScore ?? 4,
    );
    console.log('  ✓ Built Scenario 2: Control Failure Investigation (AU006)');
  }

  // ── Scenario 3: Gather IR scores for affected AUs ──────────────────────

  const scenario3AUCodes = ['AU004', 'AU003', 'AU001'];
  const auInherentRisks = new Map<string, number>();

  for (const code of scenario3AUCodes) {
    const au = auByCode.get(code);
    if (au) {
      const ir = await prisma.inherentRisk.findUnique({
        where: { auId_periodId: { auId: au.id, periodId: currentPeriod.id } },
      });
      auInherentRisks.set(code, ir?.inherentRiskScore ?? 200);
    }
  }

  const scenario3 = buildScenario3(assessmentUnits, auInherentRisks);
  console.log('  ✓ Built Scenario 3: New Regulation Impact Assessment');

  // ── Store in memory ────────────────────────────────────────────────────

  _scenarioData = {
    scenario1: scenario1 ?? buildFallbackScenario1(),
    scenario2: scenario2 ?? buildFallbackScenario2(),
    scenario3,
  };

  console.log('  ✓ Scenario data stored in memory for API access');
}

// ── Fallback builders (if AUs are missing) ────────────────────────────────

function buildFallbackScenario1(): ScenarioBeforeAfter {
  const emptyMetrics: ScenarioMetrics = {
    inherentRiskScore: 0,
    inherentRiskRating: 'N/A',
    cqiScore: 0,
    cqiInterpScore: 0,
    cpiScore: 0,
    cpiInterpScore: 0,
    cerScore: 0,
    cerRating: 'N/A',
    residualRiskScore: 0,
    residualRiskRating: 'N/A',
    aggregateResidual: 0,
    aggregateRating: 'N/A',
  };
  return {
    scenarioId: 'scenario-1-audit-remediation',
    title: 'Audit Finding Remediation',
    description: 'AU028 not found — scenario data unavailable.',
    auCode: 'AU028',
    auName: 'Trade Finance Operations Group',
    before: emptyMetrics,
    after: emptyMetrics,
  };
}

function buildFallbackScenario2(): ControlDegradationScenario {
  return {
    scenarioId: 'scenario-2-control-failure',
    title: 'Control Failure Investigation',
    description: 'AU006 not found — scenario data unavailable.',
    auCode: 'AU006',
    auName: 'Liabilities Operations Group',
    controlCode: 'CTL022',
    controlName: 'Daily Cash Reconciliation',
    degradationPattern: [],
  };
}
