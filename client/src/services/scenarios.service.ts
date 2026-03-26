import { get } from './api';

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

export interface ScenarioBeforeAfter {
  scenarioId: string;
  title: string;
  description: string;
  auCode: string;
  auName: string;
  before: ScenarioMetrics;
  after: ScenarioMetrics;
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

export function getAllScenarios() {
  return get<AllScenarioData>('/scenarios');
}

export function getScenario(id: 1 | 2 | 3) {
  return get<ScenarioBeforeAfter | ControlDegradationScenario | WhatIfRegulationScenario>(
    `/scenarios/${id}`,
  );
}
