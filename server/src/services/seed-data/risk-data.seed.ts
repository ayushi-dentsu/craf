/**
 * Seed data for risk assessments: InherentRisk, CQA, CPA, CER, ResidualRisk, Materiality.
 * Uses the actual calculation engine for mathematical consistency (Req 27.6).
 * Generates data for 2 assessment periods across all AUs and controls.
 * Requirements: 27.3, 27.4, 27.5, 27.6, 33.4
 */
import { PrismaClient, AssessmentUnit, Control, ComplianceObligation } from '@prisma/client';
import {
  calculateLikelihood,
  calculateImpact,
  calculateInherentRisk,
  calculateCQA,
  calculateCQI,
  calculateCPA,
  calculateCPI,
  calculateCER,
  calculateResidualRisk,
  aggregateResidualRisk,
  calculateMateriality,
  type LikelihoodInput,
  type ImpactInput,
  type CQAInput,
  type CPAInput,
  type CQIControlInput,
  type CPIControlInput,
} from '../risk-calculator/index.js';
import {
  ProductComplexityCategory,
  ControlRiskType,
  KCIResult,
  SelfAssessmentResult,
  ControlTestingResult,
  ResidualRiskRating,
} from '../../types/enums.js';

// ── Helpers ───────────────────────────────────────────────────────────────

/** Deterministic pseudo-random based on a seed number */
function seededPick<T>(items: T[], seed: number): T {
  return items[Math.abs(seed) % items.length];
}

/** Map monitoring mechanism string to CQA monitoring score */
function monitoringToScore(mechanism: string | null): number {
  switch (mechanism) {
    case 'MRC+IT': return 5;
    case 'NA+IT': return 5;
    case 'MRC+Manual': return 3;
    case 'MRC+IT Based Manual': return 3;
    case 'NA+IT Based Manual': return 3;
    case 'NA+Manual': return 1;
    default: return 1;
  }
}

/** Map control nature to CQA automation score */
function natureToScore(nature: string): number {
  switch (nature) {
    case 'IT-driven': return 5;
    case 'IT-based manual': return 3;
    case 'Manual': return 1;
    default: return 1;
  }
}

/** Map control type to CQA type score */
function typeToScore(controlType: string, seed: number): number {
  if (controlType === 'Preventive') return 5;
  // Detective: at activity frequency → 3, lower → 1
  return seed % 3 === 0 ? 1 : 3;
}

/** Map isDocumented to CQA documentation score */
function docToScore(isDocumented: boolean): number {
  return isDocumented ? 5 : 1;
}

// ── Risk profile definitions per AU (deterministic) ───────────────────────

interface AURiskProfile {
  volumeGrowthPercent: number;
  regulatoryReturnsCount: number;
  complianceBreachCount: number;
  icofrFailureCount: number;
  customerComplaintCount: number;
  businessImpact: number;
  mediaImpact: number;
  financialPenalty: number;
  glImpact: number;
}

/**
 * Generate a risk profile for an AU based on its code number.
 * Distributes risk: ~10% Very High/Extremely High, ~20% High, ~40% Medium, ~30% Low.
 */
function generateRiskProfile(auNum: number): AURiskProfile {
  // Bucket AUs into risk tiers
  if (auNum <= 9) {
    // ~10% — High risk AUs (includes demo AUs AU001, AU003, AU004, AU006, AU028→28)
    return {
      volumeGrowthPercent: 25 + (auNum % 30),
      regulatoryReturnsCount: 12 + (auNum % 6),
      complianceBreachCount: auNum % 3 === 0 ? 2 : 1,
      icofrFailureCount: auNum % 4 === 0 ? 2 : 0,
      customerComplaintCount: 18 + (auNum % 8),
      businessImpact: seededPick([15, 20, 25], auNum),
      mediaImpact: seededPick([10, 15, 20], auNum + 1),
      financialPenalty: auNum % 3 === 0 ? 25 : 5,
      glImpact: seededPick([15, 20, 25], auNum + 2),
    };
  }
  if (auNum <= 27) {
    // ~20% — Medium-High risk
    return {
      volumeGrowthPercent: 10 + (auNum % 20),
      regulatoryReturnsCount: 6 + (auNum % 8),
      complianceBreachCount: auNum % 5 === 0 ? 1 : 0,
      icofrFailureCount: auNum % 7 === 0 ? 1 : 0,
      customerComplaintCount: 8 + (auNum % 12),
      businessImpact: seededPick([5, 10, 15], auNum),
      mediaImpact: seededPick([5, 10, 15], auNum + 1),
      financialPenalty: 5,
      glImpact: seededPick([15, 20], auNum + 2),
    };
  }
  if (auNum <= 62) {
    // ~40% — Medium risk
    return {
      volumeGrowthPercent: 5 + (auNum % 15),
      regulatoryReturnsCount: 3 + (auNum % 5),
      complianceBreachCount: 0,
      icofrFailureCount: 0,
      customerComplaintCount: 3 + (auNum % 8),
      businessImpact: seededPick([5, 10], auNum),
      mediaImpact: seededPick([5, 10], auNum + 1),
      financialPenalty: 5,
      glImpact: 15,
    };
  }
  // ~30% — Low risk
  return {
    volumeGrowthPercent: 1 + (auNum % 5),
    regulatoryReturnsCount: auNum % 3,
    complianceBreachCount: 0,
    icofrFailureCount: 0,
    customerComplaintCount: auNum % 4,
    businessImpact: 5,
    mediaImpact: 5,
    financialPenalty: 5,
    glImpact: 15,
  };
}

/** Special overrides for demo scenario AUs */
function applyDemoOverrides(auCode: string, profile: AURiskProfile): AURiskProfile {
  // AU028 Trade Finance — Scenario 1: IR=300 (Likelihood 15 × Impact 20)
  if (auCode === 'AU028') {
    return {
      ...profile,
      volumeGrowthPercent: 12,
      regulatoryReturnsCount: 8,
      complianceBreachCount: 1,
      icofrFailureCount: 0,
      customerComplaintCount: 6,
      businessImpact: 15,
      mediaImpact: 15,
      financialPenalty: 5,
      glImpact: 20,
    };
  }
  // AU006 Liabilities Operations — Scenario 2: medium risk that worsens
  if (auCode === 'AU006') {
    return {
      ...profile,
      volumeGrowthPercent: 8,
      regulatoryReturnsCount: 5,
      complianceBreachCount: 0,
      icofrFailureCount: 0,
      customerComplaintCount: 10,
      businessImpact: 10,
      mediaImpact: 10,
      financialPenalty: 5,
      glImpact: 15,
    };
  }
  return profile;
}

// ── CPA generation helpers ────────────────────────────────────────────────

interface CPAParams {
  controlRiskType: ControlRiskType;
  kciLinked: boolean;
  kciResult: KCIResult | null;
  selfAssessmentResult: SelfAssessmentResult;
  controlTestingResult: ControlTestingResult;
}

function generateCPAParams(controlCode: string, auCode: string, seed: number, isPrevious: boolean): CPAParams {
  // Default: mostly good performance
  const riskType = seededPick(
    [ControlRiskType.Compliance, ControlRiskType.ICOFR, ControlRiskType.Converged],
    seed,
  );
  const kciLinked = seed % 3 !== 0;

  let kciResult: KCIResult | null = kciLinked ? KCIResult.Pass : null;
  let saResult = SelfAssessmentResult.Pass;
  let testResult = ControlTestingResult.Pass;

  // Vary performance based on seed
  if (seed % 7 === 0) {
    saResult = SelfAssessmentResult.PassWithException;
    testResult = ControlTestingResult.PassWithException;
  }
  if (seed % 11 === 0) {
    testResult = ControlTestingResult.NotTested;
  }
  if (seed % 13 === 0 && kciLinked) {
    kciResult = KCIResult.Fail;
  }

  // Demo: CTL022 (Daily Cash Reconciliation) in current period has degraded CPA
  if (controlCode === 'CTL022' && !isPrevious) {
    return {
      controlRiskType: ControlRiskType.Compliance,
      kciLinked: true,
      kciResult: KCIResult.Fail,
      selfAssessmentResult: SelfAssessmentResult.Fail,
      controlTestingResult: ControlTestingResult.Fail,
    };
  }
  // CTL022 in previous period was good
  if (controlCode === 'CTL022' && isPrevious) {
    return {
      controlRiskType: ControlRiskType.Compliance,
      kciLinked: true,
      kciResult: KCIResult.Pass,
      selfAssessmentResult: SelfAssessmentResult.Pass,
      controlTestingResult: ControlTestingResult.Pass,
    };
  }

  // CTL073 (LC Issuance Maker-Checker) — deficient control, poor performance too
  if (controlCode === 'CTL073') {
    return {
      controlRiskType: ControlRiskType.Compliance,
      kciLinked: false,
      kciResult: null,
      selfAssessmentResult: SelfAssessmentResult.Fail,
      controlTestingResult: ControlTestingResult.Fail,
    };
  }

  return { controlRiskType: riskType, kciLinked, kciResult, selfAssessmentResult: saResult, controlTestingResult: testResult };
}

// ── Main seed function ────────────────────────────────────────────────────

export async function seedRiskData(
  prisma: PrismaClient,
  assessmentUnits: AssessmentUnit[],
  controls: Control[],
  obligations: ComplianceObligation[],
): Promise<void> {
  // 1. Create assessment periods
  const prevPeriod = await prisma.assessmentPeriod.upsert({
    where: { id: 1 },
    update: { name: 'FY 2023-24', startDate: new Date('2023-04-01'), endDate: new Date('2024-03-31'), isCurrent: false },
    create: { name: 'FY 2023-24', startDate: new Date('2023-04-01'), endDate: new Date('2024-03-31'), isCurrent: false },
  });
  const currPeriod = await prisma.assessmentPeriod.upsert({
    where: { id: 2 },
    update: { name: 'FY 2024-25', startDate: new Date('2024-04-01'), endDate: new Date('2025-03-31'), isCurrent: true },
    create: { name: 'FY 2024-25', startDate: new Date('2024-04-01'), endDate: new Date('2025-03-31'), isCurrent: true },
  });
  console.log('  ✓ Seeded 2 assessment periods');

  const periods = [
    { period: prevPeriod, isPrevious: true },
    { period: currPeriod, isPrevious: false },
  ];

  // Build lookup maps
  const oblByAuId = new Map<number, ComplianceObligation[]>();
  for (const obl of obligations) {
    const list = oblByAuId.get(obl.auId) ?? [];
    list.push(obl);
    oblByAuId.set(obl.auId, list);
  }

  const ctrlByOblId = new Map<number, Control[]>();
  for (const ctrl of controls) {
    const list = ctrlByOblId.get(ctrl.obligationId) ?? [];
    list.push(ctrl);
    ctrlByOblId.set(ctrl.obligationId, list);
  }

  // Fetch product complexity and system complexity for likelihood inputs
  const productComplexities = await prisma.aUProductComplexity.findMany();
  const pcMap = new Map(productComplexities.map((pc) => [pc.auId, pc]));

  const systemComplexities = await prisma.aUSystemComplexity.findMany();
  // Group by AU, take max finalScore
  const scMap = new Map<number, number>();
  for (const sc of systemComplexities) {
    const existing = scMap.get(sc.auId) ?? 0;
    if (sc.finalScore > existing) scMap.set(sc.auId, sc.finalScore);
  }

  const volumeDefs = await prisma.aUVolumeDefinition.findMany();
  const volMap = new Map(volumeDefs.map((v) => [v.auId, v]));

  // Clear existing risk data
  await prisma.residualRisk.deleteMany({});
  await prisma.controlEnvironmentRating.deleteMany({});
  await prisma.controlPerformance.deleteMany({});
  await prisma.controlQuality.deleteMany({});
  await prisma.inherentRisk.deleteMany({});
  await prisma.materialityAssessment.deleteMany({});

  let irCount = 0;
  let cqaCount = 0;
  let cpaCount = 0;
  let cerCount = 0;
  let rrCount = 0;

  for (const { period, isPrevious } of periods) {
    for (const au of assessmentUnits) {
      const auNum = parseInt(au.code.replace('AU', ''), 10);
      let profile = generateRiskProfile(auNum);
      profile = applyDemoOverrides(au.code, profile);

      // Slightly lower risk in previous period for trend demonstration
      if (isPrevious) {
        profile.complianceBreachCount = Math.max(0, profile.complianceBreachCount - 1);
        profile.customerComplaintCount = Math.max(0, profile.customerComplaintCount - 2);
      }

      // Get complexity data
      const pc = pcMap.get(au.id);
      const pcCategory = pc
        ? (pc.category as ProductComplexityCategory)
        : ProductComplexityCategory.Medium;
      const sysScore = scMap.get(au.id) ?? 10;
      const vol = volMap.get(au.id);
      const growthPct = vol?.growthPercent ?? profile.volumeGrowthPercent;

      // Calculate likelihood
      const likelihoodInput: LikelihoodInput = {
        volumeGrowthPercent: isPrevious ? Math.max(0, growthPct - 3) : growthPct,
        systemComplexityScore: sysScore,
        productComplexityCategory: pcCategory,
        regulatoryReturnsCount: profile.regulatoryReturnsCount,
        complianceBreachCount: profile.complianceBreachCount,
        icofrFailureCount: profile.icofrFailureCount,
        customerComplaintCount: profile.customerComplaintCount,
      };
      const likelihood = calculateLikelihood(likelihoodInput);

      // Calculate impact
      const impactInput: ImpactInput = {
        businessImpact: profile.businessImpact,
        mediaImpact: profile.mediaImpact,
        financialPenalty: profile.financialPenalty,
        glImpact: profile.glImpact,
      };
      const impact = calculateImpact(impactInput);

      // Calculate inherent risk
      const ir = calculateInherentRisk({
        likelihoodScore: likelihood.scaledScore,
        impactScore: impact.overallScore,
      });

      // Store InherentRisk
      await prisma.inherentRisk.create({
        data: {
          auId: au.id,
          periodId: period.id,
          volumeGrowthScore: likelihood.parameterScores.volumeGrowth,
          complexityScore: likelihood.parameterScores.complexity,
          regulatoryReturnsScore: likelihood.parameterScores.regulatoryReturns,
          complianceBreachesScore: likelihood.parameterScores.complianceBreaches,
          controlFailuresScore: likelihood.parameterScores.icofrFailures,
          customerComplaintsScore: likelihood.parameterScores.customerComplaints,
          likelihoodRawAvg: Math.round(likelihood.rawAverage * 100) / 100,
          likelihoodScore: likelihood.scaledScore,
          likelihoodRating: likelihood.rating,
          businessImpactScore: impact.parameterScores.businessImpact,
          reputationalImpactScore: impact.parameterScores.mediaImpact,
          financialPenaltyScore: impact.parameterScores.financialPenalty,
          glImpactScore: impact.parameterScores.glImpact,
          impactScore: impact.overallScore,
          impactRating: impact.overallScore >= 20 ? 'Very High' : impact.overallScore >= 15 ? 'High' : 'Medium',
          inherentRiskScore: ir.inherentRiskScore,
          inherentRiskRating: ir.rating,
          assessmentDate: isPrevious ? new Date('2024-03-15') : new Date('2025-01-15'),
        },
      });
      irCount++;

      // Get controls for this AU
      const auObls = oblByAuId.get(au.id) ?? [];
      const auControls: Control[] = [];
      for (const obl of auObls) {
        const ctrls = ctrlByOblId.get(obl.id) ?? [];
        auControls.push(...ctrls);
      }

      // Calculate CQA and CPA for each control
      const cqaRawScores: (number | null)[] = [];
      const cpaRawScores: (number | null)[] = [];

      for (const ctrl of auControls) {
        const ctrlNum = parseInt(ctrl.code.replace('CTL', ''), 10);

        // CQA
        const cqaInput: CQAInput = {
          monitoringScore: monitoringToScore(ctrl.monitoringMechanism),
          automationScore: natureToScore(ctrl.controlNature),
          typeScore: typeToScore(ctrl.controlType, ctrlNum),
          documentationScore: docToScore(ctrl.isDocumented),
        };
        const cqa = calculateCQA(cqaInput);

        await prisma.controlQuality.create({
          data: {
            controlId: ctrl.id,
            periodId: period.id,
            monitoringScore: cqa.monitoringScore,
            automationScore: cqa.automationScore,
            typeScore: cqa.typeScore,
            documentationScore: cqa.documentationScore,
            cqaRawScore: cqa.rawScore,
            cqaScaledScore: cqa.scaledScore,
            controlCategory: cqa.category,
          },
        });
        cqaCount++;
        cqaRawScores.push(cqa.rawScore);

        // CPA
        const cpaParams = generateCPAParams(ctrl.code, au.code, ctrlNum + auNum, isPrevious);
        const cpaInput: CPAInput = {
          controlRiskType: cpaParams.controlRiskType,
          kciLinked: cpaParams.kciLinked,
          kciResult: cpaParams.kciResult,
          selfAssessmentResult: cpaParams.selfAssessmentResult,
          controlTestingResult: cpaParams.controlTestingResult,
        };
        const cpa = calculateCPA(cpaInput);

        await prisma.controlPerformance.create({
          data: {
            controlId: ctrl.id,
            periodId: period.id,
            controlRiskType: cpaParams.controlRiskType,
            kciLinked: cpaParams.kciLinked,
            kciResult: cpaParams.kciResult,
            selfAssessmentResult: cpaParams.selfAssessmentResult,
            kciSelfAssessmentScore: cpa.kciSelfAssessmentScore,
            controlTestingResult: cpaParams.controlTestingResult,
            controlTestingScore: cpa.controlTestingScore,
            cpaRawScore: cpa.rawScore,
            cpaScaledScore: cpa.scaledScore,
            performanceCategory: cpa.category,
          },
        });
        cpaCount++;
        cpaRawScores.push(cpa.rawScore);
      }

      // Count obligations without controls for "No Control" category
      let oblsWithoutControl = 0;
      for (const obl of auObls) {
        const ctrls = ctrlByOblId.get(obl.id) ?? [];
        if (ctrls.length === 0) oblsWithoutControl++;
      }

      // Add null entries for obligations without controls
      for (let i = 0; i < oblsWithoutControl; i++) {
        cqaRawScores.push(null);
        cpaRawScores.push(null);
      }

      // Calculate CQI
      const cqiInputs: CQIControlInput[] = cqaRawScores.map((s) => ({ cqaRawScore: s }));
      const cqi = cqiInputs.length > 0 ? calculateCQI(cqiInputs) : { weightedAvg: 1, cqiScore: 0, interpScore: 1, interpretation: 'Significant Improvement Needed', categoryBreakdown: {} as any };

      // Calculate CPI
      const cpiInputs: CPIControlInput[] = cpaRawScores.map((s) => ({ cpaRawScore: s }));
      const cpi = cpiInputs.length > 0 ? calculateCPI(cpiInputs) : { weightedAvg: 1, cpiScore: 0, interpScore: 1, interpretation: 'Significant Improvement Needed', categoryBreakdown: {} as any };

      // Calculate CER
      const cer = calculateCER({ cqiInterpScore: cqi.interpScore, cpiInterpScore: cpi.interpScore });

      // Store CER
      await prisma.controlEnvironmentRating.create({
        data: {
          auId: au.id,
          periodId: period.id,
          cqiWeightedAvg: Math.round(cqi.weightedAvg * 10000) / 10000,
          cqiScore: Math.round(cqi.cqiScore * 10000) / 10000,
          cqiInterpScore: cqi.interpScore,
          cpiWeightedAvg: Math.round(cpi.weightedAvg * 10000) / 10000,
          cpiScore: Math.round(cpi.cpiScore * 10000) / 10000,
          cpiInterpScore: cpi.interpScore,
          cerScore: cer.cerScore,
          cerRating: cer.rating,
        },
      });
      cerCount++;

      // Calculate Residual Risk
      const rr = calculateResidualRisk({
        inherentRiskScore: ir.inherentRiskScore,
        cerScore: cer.cerScore,
      });

      // Aggregate residual risk ratings
      const allRatings: ResidualRiskRating[] = [];
      if (auControls.length > 0) {
        for (let i = 0; i < auControls.length; i++) {
          allRatings.push(rr.rating);
        }
      }
      for (let i = 0; i < oblsWithoutControl; i++) {
        allRatings.push(ResidualRiskRating.NoControl);
      }
      const agg = allRatings.length > 0
        ? aggregateResidualRisk({ ratings: allRatings })
        : { aggregateResidual: 0, aggregateRating: 'Negligible' };

      await prisma.residualRisk.create({
        data: {
          auId: au.id,
          periodId: period.id,
          inherentRiskScore: ir.inherentRiskScore,
          cerScore: cer.cerScore,
          residualRiskScore: Math.round(rr.residualRiskScore * 10000) / 10000,
          residualRiskRating: rr.rating,
          aggregateResidual: Math.round(agg.aggregateResidual * 10000) / 10000,
          aggregateRating: agg.aggregateRating,
          assessmentDate: isPrevious ? new Date('2024-03-15') : new Date('2025-01-15'),
        },
      });
      rrCount++;
    }
  }

  console.log(`  ✓ Seeded ${irCount} inherent risk records`);
  console.log(`  ✓ Seeded ${cqaCount} control quality records`);
  console.log(`  ✓ Seeded ${cpaCount} control performance records`);
  console.log(`  ✓ Seeded ${cerCount} control environment rating records`);
  console.log(`  ✓ Seeded ${rrCount} residual risk records`);

  // 2. Materiality assessments
  const mat1 = calculateMateriality({ profitBeforeTax: 15000, totalAssets: 1200000, haircutPercent: 25, tolerableError: 50 });
  await prisma.materialityAssessment.create({
    data: {
      periodId: prevPeriod.id,
      profitBeforeTax: 15000,
      totalAssets: 1200000,
      revenueMateriality: mat1.revenueMateriality,
      balanceSheetMateriality: mat1.balanceSheetMateriality,
      haircutPercent: 25,
      finalRevenueMateriality: mat1.finalRevenueMateriality,
      finalBSMateriality: mat1.finalBSMateriality,
      tolerableError: 50,
    },
  });

  const mat2 = calculateMateriality({ profitBeforeTax: 18000, totalAssets: 1400000, haircutPercent: 25, tolerableError: 50 });
  await prisma.materialityAssessment.create({
    data: {
      periodId: currPeriod.id,
      profitBeforeTax: 18000,
      totalAssets: 1400000,
      revenueMateriality: mat2.revenueMateriality,
      balanceSheetMateriality: mat2.balanceSheetMateriality,
      haircutPercent: 25,
      finalRevenueMateriality: mat2.finalRevenueMateriality,
      finalBSMateriality: mat2.finalBSMateriality,
      tolerableError: 50,
    },
  });
  console.log('  ✓ Seeded 2 materiality assessments');
}
