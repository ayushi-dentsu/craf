// Business area categories for Assessment Units
export enum BusinessArea {
  RetailBanking = 'Retail Banking',
  CorporateWholesaleBanking = 'Corporate/Wholesale Banking',
  TreasuryAndMarkets = 'Treasury and Markets',
  SupportFunctions = 'Support Functions',
}

// Inherent risk ratings
export enum InherentRiskRating {
  ExtremelyHigh = 'Extremely High',
  VeryHigh = 'Very High',
  High = 'High',
  Minor = 'Minor',
  Insignificant = 'Insignificant',
}

// Likelihood ratings
export enum LikelihoodRating {
  AlmostCertain = 'Almost Certain',
  Likely = 'Likely',
  Possible = 'Possible',
  Unlikely = 'Unlikely',
  Rare = 'Rare',
}

// Control types
export enum ControlType {
  Preventive = 'Preventive',
  Detective = 'Detective',
}

// Control nature
export enum ControlNature {
  Manual = 'Manual',
  ITDriven = 'IT-driven',
  ITBasedManual = 'IT-based manual',
}

// CQA categories
export enum CQACategory {
  SignificantImprovementNeeded = 'Significant Improvement Needed',
  ImprovementNeeded = 'Improvement Needed',
  MeetsRequirement = 'Meets Requirement',
  EffectiveControl = 'Effective Control',
  SignificantlyEffectiveControl = 'Significantly Effective Control',
}

// CPA categories (same labels as CQA)
export enum CPACategory {
  SignificantImprovementNeeded = 'Significant Improvement Needed',
  ImprovementNeeded = 'Improvement Needed',
  MeetsRequirement = 'Meets Requirement',
  EffectiveControl = 'Effective Control',
  SignificantlyEffectiveControl = 'Significantly Effective Control',
}

// CER ratings
export enum CERRating {
  SignificantImprovementNeeded = 'Significant Improvement Needed',
  ImprovementNeeded = 'Improvement Needed',
  PartiallyEffective = 'Partially Effective',
  MeetsRequirement = 'Meets Requirement',
  Effective = 'Effective',
}

// Residual risk ratings (per-control level)
export enum ResidualRiskRating {
  NoControl = 'No Control',
  SignificantImprovementNeeded = 'Significant Improvement Needed',
  ImprovementNeeded = 'Improvement Needed',
  MeetsRequirement = 'Meets Requirement',
  WellControlled = 'Well Controlled',
}

// Aggregate residual risk ratings (AU/theme/enterprise level)
export enum AggregateResidualRiskRating {
  ExtremelyHigh = 'Extremely High',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  Negligible = 'Negligible',
}

// CQI / CPI interpretation ratings
export enum IndexInterpretation {
  SignificantImprovementNeeded = 'Significant Improvement Needed',
  ImprovementNeeded = 'Improvement Needed',
  PartiallyEffective = 'Partially Effective',
  MeetsRequirements = 'Meets Requirements',
  Effective = 'Effective',
}

// Control risk type for CPA scoring
export enum ControlRiskType {
  Compliance = 'Compliance',
  ICOFR = 'ICOFR',
  Converged = 'Converged',
}

// KCI result
export enum KCIResult {
  Pass = 'Pass',
  Fail = 'Fail',
  NA = 'NA',
}

// Self-assessment result
export enum SelfAssessmentResult {
  Pass = 'Pass',
  PassWithException = 'Pass with Exception',
  Fail = 'Fail',
}

// Control testing result
export enum ControlTestingResult {
  Pass = 'Pass',
  PassWithException = 'Pass with Exception',
  Fail = 'Fail',
  NotTested = 'Not Tested',
}

// Obligation criticality
export enum Criticality {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

// Compliance frequency
export enum ComplianceFrequency {
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly',
  Quarterly = 'Quarterly',
  Annual = 'Annual',
}

// Product complexity category
export enum ProductComplexityCategory {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

// System tier categories
export enum SystemTier {
  Tier0 = 'Tier 0',
  Tier1 = 'Tier 1',
  Tier2 = 'Tier 2',
  Tier3 = 'Tier 3',
}

// User roles
export enum UserRole {
  GCCO = 'GCCO',
  GCO = 'GCO',
  HeadCompliance = 'HeadCompliance',
  HeadCPR = 'HeadCPR',
  CGAdvisory = 'CGAdvisory',
  AUHead = 'AUHead',
  ComplianceMonitoring = 'ComplianceMonitoring',
}

// Early warning types
export enum EarlyWarningType {
  DeterioratingRisk = 'deteriorating_risk',
  ApproachingFailure = 'approaching_failure',
  BreachTrend = 'breach_trend',
}

// Heatmap colors
export enum HeatmapColor {
  Red = '#EF4444',
  Orange = '#F97316',
  Yellow = '#EAB308',
  LightGreen = '#84CC16',
  Green = '#22C55E',
}
