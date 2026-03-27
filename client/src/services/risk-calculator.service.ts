import { get, post } from './api';

export interface AUListItem {
  id: number;
  code: string;
  name: string;
  businessArea: string;
}

export interface ControlWithAssessments {
  id: number;
  code: string;
  name: string;
  controlType: string;
  controlNature: string;
  obligationId: number;
  obligation: { id: number; code: string; description: string; auId: number };
  qualityAssessments: Array<{
    monitoringScore: number;
    automationScore: number;
    typeScore: number;
    documentationScore: number;
    cqaRawScore: number;
    cqaScaledScore: number;
    controlCategory: string;
  }>;
  performanceAssessments: Array<{
    controlRiskType: string;
    kciLinked: boolean;
    kciResult: string | null;
    selfAssessmentResult: string;
    controlTestingResult: string;
    cpaRawScore: number;
    cpaScaledScore: number;
    performanceCategory: string;
  }>;
}

export interface InherentRiskData {
  auId: number;
  periodId: number;
  likelihoodBreakdown: {
    volumeGrowth: number;
    complexity: number;
    regulatoryReturns: number;
    complianceBreaches: number;
    controlFailures: number;
    customerComplaints: number;
    rawAvg: number;
    scaledScore: number;
    rating: string;
  };
  impactBreakdown: {
    businessImpact: number;
    reputationalImpact: number;
    financialPenalty: number;
    glImpact: number;
    overallScore: number;
    rating: string;
  };
  inherentRiskScore: number;
  inherentRiskRating: string;
}

export interface ControlEnvironmentData {
  assessmentUnit: { id: number; code: string; name: string };
  periodId: number | null;
  cer: {
    cqiWeightedAvg: number;
    cqiScore: number;
    cqiInterpScore: number;
    cpiWeightedAvg: number;
    cpiScore: number;
    cpiInterpScore: number;
    cerScore: number;
    cerRating: string;
  } | null;
}

export interface ResidualRiskData {
  residualRiskScore: number;
  residualRiskRating: string;
  aggregateResidual: number;
  aggregateRating: string;
}

export function getAssessmentUnits() {
  return get<AUListItem[]>('/assessment-units');
}

export function getControlsForAU(auId: number) {
  return get<ControlWithAssessments[]>(`/controls?auId=${auId}`);
}

export function getInherentRisk(auId: number) {
  return get<InherentRiskData>(`/inherent-risk?auId=${auId}`);
}

export function getControlEnvironment(auId: number) {
  return get<ControlEnvironmentData>(`/control-environment/${auId}`);
}

export function getResidualRisk(auId: number) {
  return get<ResidualRiskData>(`/residual-risk?auId=${auId}`);
}

export function saveInherentRisk(data: {
  auId: number;
  periodId: number;
  volumeGrowthPercent: number;
  systemComplexityScore: number;
  productComplexityCategory: string;
  regulatoryReturnsCount: number;
  complianceBreachCount: number;
  icofrFailureCount: number;
  customerComplaintCount: number;
  businessImpact: number;
  reputationalImpact: number;
  financialPenalty: number;
  glImpact: number;
}) {
  return post<InherentRiskData>('/inherent-risk', data);
}

export function saveCQA(controlId: number, data: {
  periodId: number;
  monitoringScore: number;
  automationScore: number;
  typeScore: number;
  documentationScore: number;
}) {
  return post<unknown>(`/controls/${controlId}/quality`, data);
}

export function saveCPA(controlId: number, data: {
  periodId: number;
  controlRiskType: string;
  kciLinked: boolean;
  kciResult: string | null;
  selfAssessmentResult: string;
  controlTestingResult: string;
}) {
  return post<unknown>(`/controls/${controlId}/performance`, data);
}
