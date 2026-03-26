// Executive Dashboard Response
export interface ExecutiveDashboardResponse {
  kpis: {
    overallResidualRiskScore: number;
    highCriticalRisksCount: number;
    controlEffectivenessPercent: number;
    complianceBreachTrend: number[];
  };
  heatmap: HeatmapEntry[];
  trends: {
    labels: string[];
    residualRisk: number[];
    controlEffectiveness: number[];
  };
  riskDistributionByTheme: Record<string, RiskDistribution>;
  controlsByEffectiveness: {
    effective: number;
    meetsRequirement: number;
    improvementNeeded: number;
    significantImprovement: number;
  };
}

export interface HeatmapEntry {
  auId: number;
  auName: string;
  businessArea: string;
  themeName: string;
  residualRiskScore: number;
  residualRiskRating: string;
  color: string;
  hasEarlyWarning: boolean;
}

export interface RiskDistribution {
  extremelyHigh: number;
  veryHigh: number;
  high: number;
  minor: number;
  insignificant: number;
}

// AU Detail Response
export interface AUDetailResponse {
  auInfo: {
    id: number;
    code: string;
    name: string;
    businessArea: string;
    themeName: string;
    ownerName: string;
  };
  inherentRisk: {
    likelihoodScore: number;
    likelihoodRating: string;
    likelihoodParameters: {
      volumeGrowth: { value: number; score: number };
      complexity: { value: number; score: number };
      regulatoryReturns: { value: number; score: number };
      complianceBreaches: { value: number; score: number };
      controlFailures: { value: number; score: number };
      customerComplaints: { value: number; score: number };
    };
    impactScore: number;
    impactRating: string;
    impactParameters: {
      businessImpact: { value: string; score: number };
      reputationalImpact: { value: string; score: number };
      financialPenalty: { value: string; score: number };
      glImpact: { value: string; score: number };
    };
    inherentRiskScore: number;
    inherentRiskRating: string;
  };
  controlEnvironment: {
    cqiScore: number;
    cqiInterpScore: number;
    cqiRating: string;
    cqiDistribution: Record<string, number>;
    cpiScore: number;
    cpiInterpScore: number;
    cpiRating: string;
    cpiDistribution: Record<string, number>;
    cerScore: number;
    cerRating: string;
  };
  residualRisk: {
    residualRiskScore: number;
    residualRiskRating: string;
    aggregateResidual: number;
    aggregateRating: string;
    previousPeriodScore: number | null;
    changePct: number | null;
  };
  obligations: ObligationDetail[];
  earlyWarnings: EarlyWarning[];
}

export interface ObligationDetail {
  id: number;
  code: string;
  description: string;
  frequency: string;
  criticality: string;
  controlCount: number;
  controls: ControlSummary[];
}

export interface ControlSummary {
  id: number;
  name: string;
  controlType: string;
  cqaScaledScore: number;
  cpaScaledScore: number;
  residualRiskRating: string;
}

export interface EarlyWarning {
  type: string;
  message: string;
  severity: string;
}

// Theme Detail Response
export interface ThemeDetailResponse {
  theme: {
    id: number;
    code: string;
    name: string;
    description: string | null;
  };
  aggregateResidualRisk: number;
  aggregateRating: string;
  controlEffectivenessPercent: number;
  auCount: number;
  heatmap: HeatmapEntry[];
}

// Obligation Full Detail Response (for obligation detail page)
export interface ObligationFullDetail {
  id: number;
  code: string;
  regulationSource: string;
  regulationRef: string | null;
  regulationName: string | null;
  referenceParagraph: string | null;
  description: string;
  ownerWithinAU: string | null;
  frequency: string | null;
  criticality: string | null;
  themeName: string;
  auName: string;
  controls: ObligationControlDetail[];
}

export interface ObligationControlDetail {
  id: number;
  code: string;
  name: string;
  controlType: string;
  controlNature: string;
  frequency: string | null;
  isDocumented: boolean;
  cqaScaledScore: number;
  cqaCategory: string;
  cpaScaledScore: number;
  cpaCategory: string;
  residualRiskScore: number;
  residualRiskRating: string;
}

// Early Warning List Response
export interface EarlyWarningEntry {
  auId: number;
  auName: string;
  businessArea: string;
  type: string;
  severity: 'red' | 'amber' | 'green';
  message: string;
  value: number;
  threshold: number;
}

// API Error Response
export interface ApiErrorResponse {
  status: number;
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
}
