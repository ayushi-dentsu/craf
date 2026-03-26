# Requirements Document

## Introduction

The Converged Risk Assessment Framework (CRAF) is a full-fledged product that implements the complete CRAF methodology for banking institutions. The application converges Compliance Risk and Financial Reporting Risk (ICOFR) into a unified risk assessment platform. It covers the full lifecycle from Assessment Unit identification, compliance obligation mapping, inherent risk scoring (Likelihood × Impact), materiality assessment, control quality and performance evaluation, residual risk calculation, and executive dashboard reporting. The product is delivered in three phased releases (MVP1, MVP2, MVP3), with MVP1 serving as the demo-ready foundation showcasing three business scenarios across 89+ Assessment Units, 21 regulatory themes, 100+ compliance obligations, and 300+ controls. Subsequent phases add production hardening, enterprise features, and operational polish.

## Release Phases

- **MVP1 — Demo-Ready Foundation**: Delivers the core CRAF calculation engine, all risk assessment workflows, executive dashboards, drill-down navigation, demo scenarios, seed data generation, role-based access control, error handling, and materiality assessment UI. MVP1 is the minimum viable product suitable for live demonstrations to C-Suite executives (15-20 minute demo).
- **MVP2 — Production Hardening**: Adds audit trail and activity logging, export and reporting (PDF/CSV), notification and alert system, data freshness indicators, enhanced scenario comparison, and input validation with business rule enforcement. MVP2 makes the product ready for production deployment within a single banking institution.
- **MVP3 — Enterprise Polish**: Adds theme customization and institutional branding, user management, configurable scoring thresholds and weights, dashboard personalization, and performance optimization for scale. MVP3 delivers the enterprise-grade experience for multi-institution deployment.

## Glossary

- **CRAF**: Converged Risk Assessment Framework — the integrated methodology for assessing Compliance and Financial Reporting Risk
- **Assessment_Unit (AU)**: A business unit, functional area, or process within the bank being assessed for risk, aligned to the Management Organization structure
- **Theme**: A regulatory compliance theme grouping related circulars (21 themes defined in Annexure II)
- **Cluster**: A grouping of regulatory circulars based on master directions, new regulations, or common compliance/risk themes applicable to one or more AUs
- **Compliance_Obligation**: A specific regulatory requirement emanating from a circular, documented with authority, reference, name, paragraph, owner, frequency, and theme
- **RCM**: Risk and Control Matrix — a converged document combining ICOFR and Compliance risks with associated controls
- **Inherent_Risk**: Risk measured through Likelihood × Impact without considering controls
- **Likelihood**: Probability of risk occurrence, scored across 6 parameters at AU level
- **Impact**: Financial and/or reputational loss, scored across 4 parameters at cluster level
- **Materiality_Assessment**: ICOFR process to identify significant accounts using 5% PBT for revenue items and 0.5% total assets with 25% haircut
- **CQA**: Control Quality Assessment — evaluation of control design effectiveness across 4 parameters (monitoring, automation, preventive/detective, documentation)
- **CQI**: Control Quality Index — 100% minus weighted average CQA, representing overall control design health
- **CPA**: Control Performance Assessment — evaluation of control operating effectiveness from KCI monitoring, self-assessment, and control testing
- **CPI**: Control Performance Index — 100% minus weighted average CPA, representing overall control performance health
- **CER**: Control Environment Rating — CQI Score × CPI Score, representing overall control environment effectiveness
- **Residual_Risk**: Risk remaining after controls, calculated as Inherent Risk Score ÷ CER Score
- **KCI**: Key Compliance Indicator — metric used to monitor compliance effectiveness
- **ICOFR**: Internal Controls over Financial Reporting
- **GCCO**: Group Chief Compliance Officer — framework owner
- **Rating_Override**: Manual adjustment of computed risk rating by GCCO/ICOFR officer with recorded justification
- **Scaling**: The process of mapping raw computed scores to standardized score bands (5, 10, 15, 20, 25)
- **Weighted_Average**: Aggregation method where control counts per category are multiplied by category-specific weights
- **System_Complexity**: Scoring of IT systems based on interfaces, tier categorization, and change requests
- **Product_Complexity**: Scoring of products based on ease of understanding, variants, regulatory guidelines, complexity, and supervisory focus
- **Risk_Calculator**: The backend engine that computes all CRAF scores and ratings
- **Dashboard_Service**: The service that aggregates and serves data for executive and detail views
- **Drill_Down_Navigator**: The UI component enabling 4-level navigation from Enterprise → Theme → AU → Obligation
- **Seed_Data_Generator**: The module that creates realistic sample data following all CRAF calculation formulas
- **RBAC**: Role-Based Access Control — middleware and UI enforcement layer that restricts system access based on the authenticated user's governance role
- **Audit_Trail**: The subsystem that records all significant user actions, data changes, and system events for regulatory compliance and accountability
- **Export_Service**: The service that generates PDF and CSV reports from dashboard views and data tables
- **Notification_Service**: The service that creates and delivers in-app notifications for early warnings, risk rating changes, and other system events

## Requirements

### Requirement 1: Assessment Unit Management [MVP1]

**User Story:** As a Compliance Officer, I want to manage Assessment Units aligned to the Management Organization structure, so that I can perform converged risk assessments across all business groups and support functions.

#### Acceptance Criteria

1. THE Seed_Data_Generator SHALL populate the database with all 89 Assessment Units as listed in Annexure I of the CRAF framework document
2. WHEN an Assessment Unit is created, THE Assessment_Unit SHALL store AU identifier, AU name, business area, theme assignment, owner name, description, and active status
3. THE Assessment_Unit SHALL be aligned to one of four business areas: Retail Banking, Corporate/Wholesale Banking, Treasury and Markets, or Support Functions
4. WHEN the system initializes, THE Seed_Data_Generator SHALL assign each Assessment Unit to one or more applicable regulatory themes from the 21 themes defined in Annexure II
5. THE API SHALL expose endpoints to list, retrieve, and filter Assessment Units by business area, theme, and active status

### Requirement 2: Compliance Obligation Management [MVP1]

**User Story:** As a CG Advisory team member, I want to document and manage compliance obligations at the AU level, so that I can maintain a complete inventory of regulatory requirements.

#### Acceptance Criteria

1. WHEN a compliance obligation is created, THE System SHALL store regulatory authority, regulation reference, regulation data, regulation name, reference paragraph, compliance obligation description, owner within the AU, compliance frequency, and compliance/risk theme
2. THE Seed_Data_Generator SHALL populate 100 or more compliance obligations mapped across all Assessment Units with emphasis on RBI regulations
3. WHEN obligations are listed for an Assessment Unit, THE API SHALL return all obligations with their associated controls, sorted by criticality
4. THE System SHALL support mapping each compliance obligation to exactly one of the 21 regulatory themes

### Requirement 3: Risk and Control Matrix (RCM) [MVP1]

**User Story:** As a Head of Assessment Unit, I want converged Risk and Control Matrices combining ICOFR and Compliance risks, so that I can manage all risks and controls in a unified view.

#### Acceptance Criteria

1. THE Seed_Data_Generator SHALL create 300 or more controls mapped to compliance obligations across all Assessment Units
2. WHEN a control is created, THE System SHALL store control identifier, control name, description, associated obligation, control type (Preventive/Detective), control nature (Manual/IT-driven/IT-based manual), control frequency, monitoring mechanism, documentation status, and owner role
3. WHEN controls are listed for an obligation, THE API SHALL return all associated controls with their quality and performance assessment scores for the current assessment period

### Requirement 4: Inherent Risk Assessment — Likelihood Scoring [MVP1]

**User Story:** As a Risk Assessment Officer, I want the system to calculate likelihood scores using all 6 defined parameters, so that I can accurately assess the probability of risk occurrence at the AU level.

#### Acceptance Criteria

1. WHEN calculating likelihood for an Assessment Unit, THE Risk_Calculator SHALL evaluate all 6 parameters: business/transaction volume increase, complexity of products and systems, number of regulatory returns, compliance breaches in previous 12 months, ICOFR control failures in previous 12 months, and customer complaints
2. WHEN scoring business/transaction volume increase, THE Risk_Calculator SHALL assign: 25 for more than 50% increase, 20 for 30%-50% increase, 15 for 20%-30% increase, 10 for 5%-20% increase, 5 for less than 5% increase
3. WHEN scoring complexity of products and systems, THE Risk_Calculator SHALL take the highest of product complexity score and system complexity score
4. WHEN scoring number of regulatory returns, THE Risk_Calculator SHALL assign: 25 for more than 15 returns, 20 for 11-15 returns, 15 for 6-10 returns, 10 for 1-5 returns, 5 for 0 returns
5. WHEN scoring compliance breaches in previous 12 months, THE Risk_Calculator SHALL assign: 25 for more than 1 breach, 15 for exactly 1 breach, 5 for 0 breaches
6. WHEN scoring ICOFR control failures in previous 12 months, THE Risk_Calculator SHALL assign: 25 for more than 1 failure, 15 for exactly 1 failure, 5 for 0 failures
7. WHEN scoring customer complaints, THE Risk_Calculator SHALL assign: 25 for 25 or more complaints, 20 for 20 or more and less than 25, 15 for 15 or more and less than 20, 10 for 5 or more and less than 15, 5 for less than 5 complaints
8. WHEN the average of the 6 parameter scores is computed, THE Risk_Calculator SHALL apply likelihood scaling: scores greater than 5 and less than 7.5 scale to 5, scores from 7.5 to 10 inclusive scale to 10, scores greater than 10 and less than 12.5 scale to 10, scores from 12.5 to 15 inclusive scale to 15, scores greater than 15 and less than 17.5 scale to 15, scores from 17.5 to 20 inclusive scale to 20, scores greater than 20 and less than 22.5 scale to 20, scores from 22.5 to 25 inclusive scale to 25

9. WHEN likelihood scoring is complete, THE Risk_Calculator SHALL assign a likelihood rating: 25 maps to Almost Certain, 20 maps to Likely, 15 maps to Possible, 10 maps to Unlikely, 5 maps to Rare

### Requirement 5: Inherent Risk Assessment — Impact Scoring [MVP1]

**User Story:** As a Risk Assessment Officer, I want the system to calculate impact scores using all 4 defined parameters at the cluster level, so that I can assess the financial and reputational loss potential.

#### Acceptance Criteria

1. WHEN calculating impact for a cluster, THE Risk_Calculator SHALL evaluate all 4 parameters: impact on business, impact from media coverage, financial penalties, and G/L impact
2. WHEN scoring impact on business, THE Risk_Calculator SHALL assign: 25 for complete closure of branch/business, 20 for closure exceeding 1 year, 15 for closure exceeding 6 months up to 1 year, 10 for closure exceeding 3 months up to 6 months, 5 for no closure
3. WHEN scoring impact from media coverage, THE Risk_Calculator SHALL assign: 20 for Very High reputational impact, 15 for High, 10 for Moderate, 5 for Low
4. WHEN scoring financial penalties, THE Risk_Calculator SHALL assign: 25 when a penalty is levied to the AU, 5 when no penalty is levied
5. WHEN scoring G/L impact, THE Risk_Calculator SHALL assign: 25 for Significantly High financial reporting impact, 20 for High, 15 for Medium
6. WHEN determining the overall impact score for a cluster, THE Risk_Calculator SHALL take the highest of the four parameter scores

### Requirement 6: Inherent Risk Calculation [MVP1]

**User Story:** As a Risk Assessment Officer, I want the system to compute the inherent risk score by multiplying likelihood and impact, so that I can determine which AUs are riskier on account of inherent nature.

#### Acceptance Criteria

1. WHEN computing inherent risk, THE Risk_Calculator SHALL multiply the scaled likelihood score by the impact score
2. WHEN the inherent risk score is 375 or greater, THE Risk_Calculator SHALL assign rating Extremely High
3. WHEN the inherent risk score is 200 or greater and less than 375, THE Risk_Calculator SHALL assign rating Very High
4. WHEN the inherent risk score is 100 or greater and less than 200, THE Risk_Calculator SHALL assign rating High
5. WHEN the inherent risk score is 25 or greater and less than 100, THE Risk_Calculator SHALL assign rating Minor
6. WHEN the inherent risk score is less than 25, THE Risk_Calculator SHALL assign rating Insignificant
7. THE API SHALL expose an endpoint to calculate inherent risk for a given AU and assessment period, returning the likelihood breakdown, impact breakdown, inherent risk score, and inherent risk rating

### Requirement 7: System Complexity Scoring [MVP1]

**User Story:** As a Risk Assessment Officer, I want the system to compute system complexity scores using the 3 defined parameters, so that complexity feeds accurately into the likelihood assessment.

#### Acceptance Criteria

1. WHEN scoring system complexity, THE Risk_Calculator SHALL evaluate 3 parameters: number of interfaces, critical system tier categorization, and number of change requests
2. WHEN scoring number of interfaces, THE Risk_Calculator SHALL assign: 5 for 0-3 interfaces, 10 for 4-9, 15 for 10-15, 20 for 16-24, 25 for more than 25
3. WHEN scoring critical system tier, THE Risk_Calculator SHALL assign: 5 for Tier 3, 15 for Tier 2, 20 for Tier 1, 25 for Tier 0
4. WHEN scoring number of change requests, THE Risk_Calculator SHALL assign: 5 for 5 or fewer, 10 for more than 5 up to 10, 15 for more than 10 up to 20, 20 for more than 20 up to 30, 25 for more than 30
5. WHEN computing the final system complexity score for a single system, THE Risk_Calculator SHALL calculate the weighted average of the 3 parameters and round to the next multiple of 5
6. WHEN multiple systems are mapped to a single AU, THE Risk_Calculator SHALL compute the simple average of all system final scores and then apply scaling to the nearest standard score band

### Requirement 8: Product Complexity Scoring [MVP1]

**User Story:** As a Risk Assessment Officer, I want the system to compute product complexity scores using the 5 defined parameters, so that product complexity feeds accurately into the likelihood assessment.

#### Acceptance Criteria

1. WHEN scoring product complexity, THE Risk_Calculator SHALL evaluate 5 parameters: ease of understanding of product/process by customer, product variants, number of applicable regulatory guidelines, complexity of guidelines, and supervisory focus
2. WHEN scoring each product complexity parameter, THE Risk_Calculator SHALL use scores of 1, 3, or 9
3. WHEN computing the product complexity score, THE Risk_Calculator SHALL multiply all parameter scores together
4. WHEN categorizing product complexity for Business Groups, THE Risk_Calculator SHALL assign: Low for 243 and lower, Medium for 244-2187, High for greater than 2188
5. WHEN categorizing product complexity for Operations and Support Groups, THE Risk_Calculator SHALL assign: Low for 81 and lower, Medium for 82-729, High for greater than 729
6. WHEN the Assessment Unit is an Operations or Support Group, THE Risk_Calculator SHALL exclude the product variant parameter from the product complexity calculation

### Requirement 9: Materiality Assessment for ICOFR [MVP1]

**User Story:** As an ICOFR team member, I want the system to perform materiality assessment to identify significant accounts, so that I can focus ICOFR controls on material financial reporting areas.

#### Acceptance Criteria

1. WHEN calculating overall materiality for revenue items, THE Risk_Calculator SHALL compute 5% of Profit Before Tax of the standalone bank
2. WHEN calculating overall materiality for balance sheet items, THE Risk_Calculator SHALL compute 0.5% of total assets of the standalone bank
3. WHEN arriving at the overall materiality limit, THE Risk_Calculator SHALL apply a 25% haircut to the computed materiality values
4. THE System SHALL support configuration of tolerable error per the bank's internal threshold
5. WHEN identifying significant accounts, THE Risk_Calculator SHALL perform quantitative analysis at Account level (Level 3) of the trial balance using the materiality threshold
6. WHEN accounts are not identified as significant at Account level, THE Risk_Calculator SHALL aggregate at Head level (Level 2) and apply thresholds to identify additional significant accounts
7. WHEN non-significant accounts and zero-balance accounts remain, THE System SHALL support qualitative review based on purpose of account, nature of entries, volume and complexity of transactions, and susceptibility to fraud
8. WHEN significant accounts are identified, THE System SHALL map the significant accounts to products, business groups, and processes

### Requirement 10: Control Quality Assessment (CQA) [MVP1]

**User Story:** As an Assessment Unit head, I want the system to assess control design effectiveness using the 4 defined parameters, so that I can understand the quality of controls mitigating compliance and financial reporting risk.

#### Acceptance Criteria

1. WHEN assessing control quality, THE Risk_Calculator SHALL evaluate 4 design parameters: monitoring mechanism, automation level, preventive/detective nature, and documentation status
2. WHEN scoring monitoring mechanism, THE Risk_Calculator SHALL assign: 5 for automated maker-checker (MRC+IT), 5 for HLC or fully automated (NA+IT), 3 for manual maker-checker (MRC+Manual or MRC+IT Based Manual), 3 for IT based manual without maker-checker (NA+IT Based Manual), 1 for manual without maker-checker (NA+Manual)
3. WHEN scoring automation level, THE Risk_Calculator SHALL assign: 5 for IT driven, 3 for IT based manual, 1 for manual
4. WHEN scoring preventive/detective nature, THE Risk_Calculator SHALL assign: 5 for preventive, 3 for detective at activity frequency, 1 for detective at lower than activity frequency
5. WHEN scoring documentation status, THE Risk_Calculator SHALL assign: 5 for well-documented policy/process, 1 for no documentation
6. WHEN computing the CQA raw score, THE Risk_Calculator SHALL multiply all 4 parameter scores together
7. WHEN scaling the CQA raw score, THE Risk_Calculator SHALL apply: less than 9 scales to 5, 9 or more and less than 81 scales to 10, 81 or more and less than 225 scales to 15, 225 or more and less than 500 scales to 20, 500 or more scales to 25
8. WHEN interpreting the scaled CQA score, THE Risk_Calculator SHALL assign: 5 is Significant Improvement Needed, 10 is Improvement Needed, 15 is Meets Requirement, 20 is Effective Control, 25 is Significantly Effective Control

### Requirement 11: Control Quality Index (CQI) Calculation [MVP1]

**User Story:** As a Compliance Monitoring team member, I want the system to compute the Control Quality Index from weighted average CQA scores, so that I can understand the overall control design health of an Assessment Unit.

#### Acceptance Criteria

1. WHEN computing weighted average CQA, THE Risk_Calculator SHALL categorize controls and apply weights: No Control (obligations without control) at 100%, Significant Improvement Needed (CQA raw score less than 15) at 80%, Improvement Needed (CQA raw score 15 or more and less than 30) at 60%, Meets Requirements (CQA raw score 30 or more and less than 60) at 40%, Effective Control (CQA raw score 60 or more and less than 125) at 30%, Significantly Effective Control (CQA raw score equal to 125) at 20%
2. WHEN computing the CQI, THE Risk_Calculator SHALL subtract the weighted average CQA from 100%
3. WHEN interpreting the CQI, THE Risk_Calculator SHALL assign: less than 40% is Significant Improvement Needed with score 1, 40% or more is Improvement Needed with score 4, 60% or more is Partially Effective with score 9, 70% or more is Meets Requirements with score 16, 80% or more is Effective with score 25

### Requirement 12: Control Performance Assessment (CPA) — KCI and Self-Assessment [MVP1]

**User Story:** As a Compliance Monitoring team member, I want the system to compute control performance scores from KCI monitoring and first-line self-assessment results, so that I can evaluate operating effectiveness of controls.

#### Acceptance Criteria

1. WHEN computing CPA for Compliance controls with KCI linked and KCI Pass and Self-Assessment Pass, THE Risk_Calculator SHALL assign score 5
2. WHEN computing CPA for Compliance controls with KCI linked and KCI Fail and Self-Assessment Pass, THE Risk_Calculator SHALL assign score 1
3. WHEN computing CPA for Compliance controls with KCI linked and KCI Pass and Self-Assessment Fail, THE Risk_Calculator SHALL assign score 1
4. WHEN computing CPA for Compliance controls with KCI not linked and Self-Assessment Pass, THE Risk_Calculator SHALL assign score 3
5. WHEN computing CPA for Compliance controls with KCI not linked and Self-Assessment Fail, THE Risk_Calculator SHALL assign score 1
6. WHEN computing CPA for ICOFR controls with KCI linked and KCI Pass and Self-Assessment Pass, THE Risk_Calculator SHALL assign score 5
7. WHEN computing CPA for ICOFR controls with KCI linked and KCI Pass and Self-Assessment Pass with Exception, THE Risk_Calculator SHALL assign score 3
8. WHEN computing CPA for ICOFR controls with KCI linked and KCI Pass and Self-Assessment Fail, THE Risk_Calculator SHALL assign score 1
9. WHEN computing CPA for ICOFR controls with KCI linked and KCI Fail regardless of Self-Assessment result, THE Risk_Calculator SHALL assign score 1
10. WHEN computing CPA for ICOFR controls with KCI not linked and Self-Assessment Pass or Pass with Exception, THE Risk_Calculator SHALL assign score 3
11. WHEN computing CPA for ICOFR controls with KCI not linked and Self-Assessment Fail, THE Risk_Calculator SHALL assign score 1
12. WHEN computing CPA for Converged controls, THE Risk_Calculator SHALL apply the same scoring matrix as ICOFR controls

### Requirement 13: Control Performance Assessment (CPA) — Control Testing and Scaling [MVP1]

**User Story:** As a Compliance Monitoring team member, I want the system to incorporate control testing results and compute scaled CPA scores, so that I can arrive at a complete control performance picture.

#### Acceptance Criteria

1. WHEN scoring control testing results, THE Risk_Calculator SHALL assign: 5 for Pass, 3 for Pass with Exception, 1 for Fail, 5 for Not Tested
2. WHEN computing the CPA raw score, THE Risk_Calculator SHALL multiply the KCI/Self-Assessment score by the control testing score
3. WHEN scaling the CPA raw score, THE Risk_Calculator SHALL apply: 1 scales to 5, 3 scales to 5, 5 scales to 5, 9 scales to 10, 15 scales to 15, 25 scales to 25
4. WHEN interpreting the scaled CPA score, THE Risk_Calculator SHALL assign: 5 is Significant Improvement Needed, 10 is Improvement Needed, 15 is Meets Requirement, 20 is Effective Control, 25 is Significantly Effective Control

### Requirement 14: Control Performance Index (CPI) Calculation [MVP1]

**User Story:** As a Compliance Monitoring team member, I want the system to compute the Control Performance Index from weighted average CPA scores, so that I can understand the overall control performance health of an Assessment Unit.

#### Acceptance Criteria

1. WHEN computing weighted average CPA, THE Risk_Calculator SHALL categorize controls and apply weights: No Control (obligations without control) at 100%, Significant Improvement Needed (CPA score 5 or more and less than 45) at 80%, Improvement Needed (CPA score 45 or more and less than 225) at 60%, Meets Requirements (CPA score 225 or more and less than 250) at 40%, Effective Control (CPA score 250 or more and less than 375) at 30%, Significantly Effective Control (CPA score 250 or more and less than 375) at 20%
2. WHEN computing the CPI, THE Risk_Calculator SHALL subtract the weighted average CPA from 100%
3. WHEN interpreting the CPI, THE Risk_Calculator SHALL assign: less than 40% is Significant Improvement Needed with score 1, 40% or more is Improvement Needed with score 4, 60% or more is Partially Effective with score 9, 70% or more is Meets Requirements with score 16, 80% or more is Effective with score 25

### Requirement 15: Control Environment Rating (CER) [MVP1]

**User Story:** As a Compliance Monitoring team member, I want the system to compute the Control Environment Rating from CQI and CPI, so that I can understand the overall control environment effectiveness.

#### Acceptance Criteria

1. WHEN computing the CER, THE Risk_Calculator SHALL multiply the CQI score by the CPI score
2. WHEN interpreting the CER, THE Risk_Calculator SHALL assign: less than 15 is Significant Improvement Needed, 15 or more and less than 30 is Improvement Needed, 30 or more and less than 60 is Partially Effective, 60 or more and less than 125 is Meets Requirement, 125 or more is Effective
3. THE API SHALL expose an endpoint returning CER with CQI breakdown, CPI breakdown, and CER rating for a given AU and assessment period

### Requirement 16: Residual Risk Calculation [MVP1]

**User Story:** As a Compliance Monitoring team member, I want the system to compute residual risk by dividing inherent risk by the control environment rating, so that I can determine the effectiveness of controls in mitigating inherent risk.

#### Acceptance Criteria

1. WHEN computing residual risk for a control, THE Risk_Calculator SHALL divide the inherent risk score by the CER score
2. WHEN no control exists for an obligation, THE Risk_Calculator SHALL assign residual risk rating of No Control
3. WHEN the residual risk score is 6.67 or greater, THE Risk_Calculator SHALL assign rating Significant Improvement Needed
4. WHEN the residual risk score is less than 6.67 and greater than 2, THE Risk_Calculator SHALL assign rating Improvement Needed
5. WHEN the residual risk score is 2 or less and greater than 1, THE Risk_Calculator SHALL assign rating Meets Requirement
6. WHEN the residual risk score is 1 or less, THE Risk_Calculator SHALL assign rating Well Controlled

### Requirement 17: Residual Risk Aggregation [MVP1]

**User Story:** As a Compliance Monitoring team member, I want the system to aggregate residual risk from control level to AU and theme levels using defined weights, so that I can view risk at multiple organizational levels.

#### Acceptance Criteria

1. WHEN aggregating residual risk, THE Risk_Calculator SHALL apply weights: No Control at 100%, Significant Improvement Needed at 80%, Improvement Needed at 60%, Meets Requirement at 25%, Well Controlled at 1%
2. WHEN computing aggregate residual risk for an AU, THE Risk_Calculator SHALL count controls under each residual risk category, multiply counts by category weights, sum the products, and divide by total number of controls
3. WHEN interpreting aggregate residual risk, THE Risk_Calculator SHALL assign: 70% or more is Extremely High, 45% or more and less than 70% is High, greater than 5% and less than 45% is Medium, greater than 1% and up to 5% is Low, 1% or less is Negligible
4. THE API SHALL expose endpoints returning residual risk at AU level, theme level, and enterprise level with drill-down capability

### Requirement 18: Rating Override [MVP1]

**User Story:** As a GCCO, I want to override computed risk ratings based on expert judgment or external factors, so that I can account for factors not captured by the model.

#### Acceptance Criteria

1. WHEN a rating override is initiated, THE System SHALL require the GCCO or ICOFR officer to record the reason for the override
2. WHEN a rating override is submitted, THE System SHALL store the original computed rating, the overridden rating, the reason, the officer who initiated the override, and the timestamp
3. WHEN a rating override is applied, THE System SHALL recalculate downstream metrics (residual risk aggregation) using the overridden rating
4. THE System SHALL support override triggers including: industry warnings to competitors, significant litigation against a business group, and other expert judgment factors

### Requirement 19: Executive Dashboard [MVP1]

**User Story:** As a C-Suite executive, I want an executive dashboard providing at-a-glance enterprise-wide risk posture, so that I can make informed decisions about risk management.

#### Acceptance Criteria

1. WHEN the executive dashboard loads, THE Dashboard_Service SHALL display four KPIs: Overall Residual Risk Score, Number of High/Critical Risks, Control Effectiveness Percentage, and Compliance Breach Trend
2. WHEN the executive dashboard loads, THE Dashboard_Service SHALL display an enterprise risk heatmap showing all Assessment Units color-coded by residual risk rating: Red for Extremely High, Orange for Very High, Yellow for High, Light Green for Minor, Green for Insignificant
3. WHEN a user hovers over an AU in the heatmap, THE Dashboard_Service SHALL display AU name, residual risk score, and rating
4. WHEN a user clicks an AU in the heatmap, THE Drill_Down_Navigator SHALL navigate to the AU detail view
5. WHEN the executive dashboard loads, THE Dashboard_Service SHALL display risk trend charts showing residual risk over the last 2 years with quarterly data points
6. WHEN the executive dashboard loads, THE Dashboard_Service SHALL display risk distribution by theme and controls by effectiveness category
7. THE Dashboard_Service SHALL support toggling between real-time and periodic assessment views
8. THE Dashboard_Service SHALL support filtering by business area, risk rating, and theme

### Requirement 20: Drill-Down Navigation [MVP1]

**User Story:** As a Compliance Officer, I want 4-level drill-down navigation from Enterprise to Theme to AU to Obligation, so that I can investigate risk at any level of detail.

#### Acceptance Criteria

1. THE Drill_Down_Navigator SHALL support 4 levels: Enterprise level showing all AUs, Theme level filtering to a specific regulatory theme, AU level showing detailed risk assessment, and Obligation level showing specific compliance obligations with associated controls
2. WHEN navigating between levels, THE Drill_Down_Navigator SHALL maintain breadcrumb navigation for easy return to previous views
3. WHEN at the AU detail level, THE Dashboard_Service SHALL display inherent risk breakdown (likelihood parameters and impact parameters), control environment section (CQI with category distribution, CPI with testing results, CER calculation), residual risk calculation with comparison to previous period, and obligations/controls table that is sortable and filterable

### Requirement 21: Comparison Views [MVP1]

**User Story:** As a Head of Compliance, I want year-over-year and before/after comparison views, so that I can track risk trends and demonstrate control improvements.

#### Acceptance Criteria

1. WHEN viewing year-over-year comparison, THE Dashboard_Service SHALL display side-by-side current year versus previous year metrics with changes highlighted in red for deterioration and green for improvement
2. WHEN viewing year-over-year comparison, THE Dashboard_Service SHALL show delta percentages for key metrics at Enterprise, Theme, and AU levels
3. WHEN viewing before/after control implementation comparison, THE Dashboard_Service SHALL display split-screen showing risk metrics before and after control changes with impact on CQI, CPI, CER, and residual risk
4. THE API SHALL expose comparison endpoints accepting current and previous period identifiers

### Requirement 22: Early Warning Indicators [MVP1]

**User Story:** As a Head of Operational Risk, I want early warning indicators to alert me of emerging risks, so that I can take proactive action before risks materialize.

#### Acceptance Criteria

1. WHEN an AU's residual risk score increases by more than 10% compared to the previous period, THE Dashboard_Service SHALL flag the AU with a deteriorating risk trend indicator
2. WHEN a control's performance score is declining across consecutive assessment periods, THE Dashboard_Service SHALL flag the control as approaching failure threshold
3. WHEN an AU shows increasing compliance breaches over consecutive periods, THE Dashboard_Service SHALL display a breach trend warning
4. THE Dashboard_Service SHALL display traffic light color indicators (Red/Yellow/Green) for all risk levels across the dashboard

### Requirement 23: RBI Compliance Status Dashboard [MVP1]

**User Story:** As a Group Compliance Officer, I want a dedicated RBI compliance status dashboard, so that I can track regulatory compliance posture and upcoming deadlines.

#### Acceptance Criteria

1. WHEN the RBI compliance dashboard loads, THE Dashboard_Service SHALL display an overall RBI compliance score as a percentage of obligations in compliance
2. WHEN the RBI compliance dashboard loads, THE Dashboard_Service SHALL display a regulatory returns status table showing all returns with submission status
3. WHEN the RBI compliance dashboard loads, THE Dashboard_Service SHALL display recent compliance breaches from the last 90 days with severity
4. WHEN the RBI compliance dashboard loads, THE Dashboard_Service SHALL display upcoming regulatory submission deadlines
5. THE Dashboard_Service SHALL display a compliance score trend chart over the last 12 months

### Requirement 24: Demo Scenario 1 — Audit Finding Remediation [MVP1]

**User Story:** As a Head of Compliance, I want to demonstrate the audit finding remediation workflow for Trade Finance, so that I can show how the system tracks control improvements and their impact on residual risk.

#### Acceptance Criteria

1. WHEN the demo starts, THE Seed_Data_Generator SHALL have pre-populated Trade Finance AU with High residual risk (inherent risk score of 300, rating Very High) and a low CQI score of 40% due to a control deficiency in LC issuance maker-checker controls
2. WHEN the user navigates to the before/after comparison view, THE Dashboard_Service SHALL show the control improvement: before state with manual process and no maker-checker (CQA score 1) and after state with automated maker-checker (CQA score 25)
3. WHEN the after-state is applied, THE Risk_Calculator SHALL recalculate showing CQI improved from 40% to 75% and residual risk reduced from 300 to 120 with rating changing from Very High to Minor
4. WHEN the AU status changes, THE Dashboard_Service SHALL update the heatmap color from Red to Yellow

### Requirement 25: Demo Scenario 2 — Control Failure Investigation [MVP1]

**User Story:** As a Head of Operational Risk, I want to demonstrate the control failure investigation workflow for Retail Liabilities, so that I can show how the system identifies, investigates, and remediates control failures.

#### Acceptance Criteria

1. WHEN the demo starts, THE Seed_Data_Generator SHALL have pre-populated Retail Liabilities AU with an early warning indicator triggered by 3 KCI failures in the past month for the Daily Cash Reconciliation control
2. WHEN the user navigates to the failed control, THE Dashboard_Service SHALL show CPA score degraded from 25 to 5 with Control Performance Category of Significant Improvement Needed
3. WHEN the user views the AU-level impact, THE Dashboard_Service SHALL show CPI decreased from 80% to 55% and residual risk increased from 50 to 95 with rating changing from Medium to High
4. WHEN the user views the trend chart, THE Dashboard_Service SHALL display the degradation pattern over 3 months

### Requirement 26: Demo Scenario 3 — New Regulation Impact Assessment [MVP1]

**User Story:** As a GCCO, I want to demonstrate the new regulation impact assessment workflow for Digital Lending, so that I can show how the system assesses the impact of new RBI regulations across multiple AUs.

#### Acceptance Criteria

1. WHEN the demo starts, THE Seed_Data_Generator SHALL have pre-populated a new RBI Master Direction on Digital Lending affecting 3 AUs: Digital Banking with 5 new obligations, Cards and Payment Systems with 3 new obligations, and Retail Assets with 7 new obligations
2. WHEN the user views the impact assessment, THE Dashboard_Service SHALL display the list of affected AUs with new obligation counts and inherent risk recalculation showing the regulatory returns parameter updated
3. WHEN the user views what-if scenario modeling, THE Dashboard_Service SHALL display 3 scenarios: no new controls showing residual risk increasing to Very High, basic controls showing residual risk staying at High, and comprehensive controls showing residual risk managed at Medium
4. WHEN the user views the enterprise impact, THE Dashboard_Service SHALL display total new obligations across the bank (15), and projected residual risk impact for each scenario

### Requirement 27: Sample Data Generation [MVP1]

**User Story:** As a developer, I want the system to generate realistic sample data following all CRAF calculation formulas, so that the demo presents coherent and mathematically consistent results.

#### Acceptance Criteria

1. THE Seed_Data_Generator SHALL create sample data for all 89 Assessment Units with realistic names matching Annexure I
2. THE Seed_Data_Generator SHALL create sample data for all 21 regulatory themes matching Annexure II
3. THE Seed_Data_Generator SHALL generate inherent risk scores distributed across the full rating spectrum (Extremely High through Insignificant) with some AUs intentionally high-risk for demo scenarios
4. THE Seed_Data_Generator SHALL generate control effectiveness data with a mix of effective, adequate, and deficient controls, including some controls showing deterioration for early warning demonstration
5. THE Seed_Data_Generator SHALL generate historical data for at least 2 assessment periods to support year-over-year comparison and trend analysis
6. WHEN sample data is generated, THE Seed_Data_Generator SHALL ensure all computed scores (inherent risk, CQA, CQI, CPA, CPI, CER, residual risk) are mathematically consistent with the CRAF formulas

### Requirement 28: Technical Architecture and API [MVP1]

**User Story:** As a developer, I want a well-structured technical architecture with React.js frontend, Node.js backend, and PostgreSQL database, so that the prototype is maintainable and demonstrable.

#### Acceptance Criteria

1. THE System SHALL use React.js with TypeScript for the frontend, Node.js with Express.js for the backend, PostgreSQL for the database, Tailwind CSS with Shadcn/ui for styling, and Recharts for data visualizations
2. THE API SHALL follow RESTful conventions with JSON request and response formats
3. THE API SHALL expose endpoints for: authentication, executive dashboard data, assessment unit details, inherent risk calculation, control quality and performance data, residual risk data, comparison data, and RBI compliance status
4. WHEN any dashboard view loads, THE System SHALL respond within 2 seconds
5. WHEN any API endpoint is called, THE System SHALL respond within 500 milliseconds

### Requirement 29: Governance Structure and Roles [MVP1]

**User Story:** As a system administrator, I want the system to reflect the CRAF governance structure with defined roles and responsibilities, so that the demo accurately represents the bank's organizational model.

#### Acceptance Criteria

1. THE System SHALL support role-based views for: GCCO, Group Compliance Officer, Head of Compliance and ICOFR, Head of Compliance Process Re-Engineering, CG Advisory team, Assessment Unit heads, and Compliance Monitoring team
2. WHEN a user logs in, THE System SHALL display role-appropriate views and actions based on the 16 defined processes in the governance structure
3. THE Seed_Data_Generator SHALL create sample users representing each governance role for demo purposes

### Requirement 30: Volume Definitions for Assessment Units [MVP1]

**User Story:** As a Risk Assessment Officer, I want each Assessment Unit to have specific volume definitions for transaction counting, so that the business/transaction volume likelihood parameter is accurately assessed.

#### Acceptance Criteria

1. THE Seed_Data_Generator SHALL store volume definitions for each Assessment Unit as specified in Annexure IV of the CRAF framework document
2. WHEN calculating the business/transaction volume increase parameter for likelihood, THE Risk_Calculator SHALL use the AU-specific volume definition to determine the percentage increase
3. THE API SHALL expose volume definition data as part of the AU detail endpoint


### Requirement 31: Role-Based Access Control (RBAC) [MVP1]

**User Story:** As a system administrator, I want role-based access control enforcing which users can view and modify data, so that the system reflects the bank's governance hierarchy.

#### Acceptance Criteria

1. THE System SHALL implement RBAC middleware that enforces permissions on every API endpoint based on the authenticated user's role
2. WHEN a GCCO logs in, THE System SHALL grant full read/write access to all AUs, overrides, and dashboard views
3. WHEN a Group Compliance Officer logs in, THE System SHALL grant read access to all AUs and write access to compliance obligations and controls within their scope
4. WHEN an AU Head logs in, THE System SHALL restrict access to only their assigned Assessment Units and associated data
5. WHEN a Compliance Monitoring team member logs in, THE System SHALL grant read access to control quality and performance data across all AUs but restrict write access to assessment entries within their scope
6. THE Frontend SHALL implement route guards that hide navigation items and disable actions not permitted for the current user's role
7. THE System SHALL define a role-permission matrix mapping each of the 7 governance roles to specific API endpoints and UI views

### Requirement 32: Error Handling and Edge Cases [MVP1]

**User Story:** As a developer, I want comprehensive error handling across the calculation engine and API layer, so that the system gracefully handles invalid data and edge cases.

#### Acceptance Criteria

1. WHEN the CER score is zero or undefined, THE Risk_Calculator SHALL assign residual risk rating of "No Control" instead of attempting division
2. WHEN an API endpoint receives invalid parameters, THE System SHALL return a structured error response with HTTP status code, error code, and human-readable message
3. THE System SHALL implement frontend error boundaries that display user-friendly error messages without exposing technical details
4. WHEN a calculation produces a score outside expected bounds, THE Risk_Calculator SHALL log a warning and clamp the value to the nearest valid score band
5. THE API SHALL validate all request payloads against defined schemas and reject malformed requests with 400 status codes

### Requirement 33: Materiality Assessment UI and API [MVP1]

**User Story:** As an ICOFR team member, I want a dedicated materiality assessment page with API endpoints, so that I can view and manage materiality calculations through the application.

#### Acceptance Criteria

1. THE API SHALL expose GET and POST endpoints for materiality assessment data at /api/materiality
2. WHEN the materiality page loads, THE System SHALL display the current materiality calculation showing PBT, total assets, revenue materiality, balance sheet materiality, haircut percentage, and final materiality limits
3. WHEN the materiality page loads, THE System SHALL display a waterfall visualization showing the flow from financial inputs to significant account identification
4. THE Seed_Data_Generator SHALL create sample materiality assessment data for both assessment periods


### Requirement 34: Audit Trail and Activity Log [MVP2]

**User Story:** As a GCCO, I want a comprehensive audit trail recording all significant actions in the system, so that I can demonstrate regulatory compliance and accountability.

#### Acceptance Criteria

1. WHEN any user performs a write operation (create, update, delete), THE Audit_Trail SHALL record the action type, entity affected, user who performed the action, timestamp, and before/after values
2. WHEN a risk recalculation is triggered, THE Audit_Trail SHALL log the trigger source, affected AUs, and resulting score changes
3. THE System SHALL expose an audit log page accessible to GCCO and Head of Compliance roles showing filterable activity history
4. THE API SHALL expose GET endpoints for audit trail data with filtering by user, action type, entity, and date range

### Requirement 35: Export and Reporting [MVP2]

**User Story:** As a C-Suite executive, I want to export dashboard views and risk reports, so that I can share risk posture information in board meetings and regulatory submissions.

#### Acceptance Criteria

1. WHEN a user clicks "Export PDF" on any dashboard view, THE Export_Service SHALL generate a formatted PDF report containing the current view's charts, tables, and KPIs
2. WHEN a user clicks "Export CSV" on any data table, THE Export_Service SHALL generate a CSV file containing the table data with appropriate headers
3. THE Export_Service SHALL provide a "Generate Board Report" function that produces a comprehensive PDF summarizing enterprise risk posture, top risks, control effectiveness trends, and compliance status
4. THE Export_Service SHALL include report generation timestamp, period covered, and user who generated the report


### Requirement 36: Notification and Alert System [MVP2]

**User Story:** As a Compliance Officer, I want to receive notifications when early warnings are triggered or risk ratings change, so that I can respond promptly to emerging risks.

#### Acceptance Criteria

1. WHEN an early warning is triggered, THE Notification_Service SHALL create an in-app notification for the relevant AU head and compliance monitoring team
2. WHEN a residual risk rating changes by one or more levels, THE Notification_Service SHALL notify the GCCO and relevant AU head
3. THE System SHALL display a notification bell icon in the header with unread count badge
4. WHEN a user clicks the notification bell, THE System SHALL display a dropdown list of recent notifications with links to relevant views

### Requirement 37: Data Freshness Indicators [MVP2]

**User Story:** As a dashboard user, I want to see when data was last calculated and updated, so that I can trust the currency of the information displayed.

#### Acceptance Criteria

1. WHEN any dashboard view loads, THE Dashboard_Service SHALL display a "Last Calculated" timestamp showing when risk scores were last computed
2. WHEN any dashboard view loads, THE Dashboard_Service SHALL display a "Data As Of" indicator showing the assessment period and date of the underlying data
3. WHEN data is older than a configurable threshold, THE Dashboard_Service SHALL display a warning indicator suggesting recalculation


### Requirement 38: Enhanced Scenario Comparison [MVP2]

**User Story:** As a GCCO, I want to overlay multiple what-if scenarios on the same visualization, so that I can compare the impact of different control strategies side by side.

#### Acceptance Criteria

1. WHEN viewing scenario comparison, THE Dashboard_Service SHALL support overlaying up to 3 scenarios on the same chart with distinct colors and legends
2. WHEN toggling between scenarios, THE Dashboard_Service SHALL animate the transition showing metric changes
3. THE System SHALL allow saving scenario configurations for future reference

### Requirement 39: Input Validation and Data Integrity [MVP2]

**User Story:** As a system administrator, I want the system to validate all data inputs against CRAF business rules, so that calculation integrity is maintained.

#### Acceptance Criteria

1. WHEN a score parameter is entered, THE System SHALL validate it falls within the allowed values for that parameter type (e.g., 1/3/5 for CQA parameters, 5/10/15/20/25 for likelihood parameters)
2. WHEN a control is created or updated, THE System SHALL validate that the monitoring mechanism, control nature, and control type values are consistent
3. THE System SHALL prevent saving assessment data that would produce mathematically inconsistent results in downstream calculations


### Requirement 40: Theme Customization [MVP3]

**User Story:** As a system administrator, I want to customize the application's visual theme, so that the application can be branded for different banking institutions.

#### Acceptance Criteria

1. THE System SHALL support light and dark mode toggle
2. THE System SHALL support configurable primary and accent colors for institutional branding
3. THE System SHALL persist theme preferences per user

### Requirement 41: User Management [MVP3]

**User Story:** As a system administrator, I want to manage users and role assignments through the application, so that I can onboard and offboard users without database access.

#### Acceptance Criteria

1. THE System SHALL provide a user management page accessible to GCCO role for creating, editing, and deactivating user accounts
2. THE System SHALL support assigning and changing user roles through the management interface
3. THE System SHALL enforce password complexity requirements and support password reset


### Requirement 42: Configurable Thresholds [MVP3]

**User Story:** As a GCCO, I want to configure scoring thresholds and weights used in CRAF calculations, so that the framework can be adapted to evolving risk appetite.

#### Acceptance Criteria

1. THE System SHALL provide a configuration page for adjusting inherent risk rating thresholds
2. THE System SHALL provide a configuration page for adjusting residual risk aggregation weights
3. THE System SHALL provide a configuration page for adjusting materiality haircut percentage and tolerable error
4. WHEN thresholds are changed, THE System SHALL trigger recalculation of all affected scores and ratings

### Requirement 43: Dashboard Personalization [MVP3]

**User Story:** As a frequent dashboard user, I want to save my preferred filters and favorite AUs, so that I can quickly access the views most relevant to my role.

#### Acceptance Criteria

1. THE System SHALL allow users to save filter configurations as named presets
2. THE System SHALL allow users to mark AUs as favorites for quick access
3. THE System SHALL remember the user's last-used filters and view settings across sessions


### Requirement 44: Performance Optimization [MVP3]

**User Story:** As a system administrator, I want the system to handle increased data volumes efficiently, so that performance remains acceptable as the bank scales.

#### Acceptance Criteria

1. THE System SHALL implement API response caching with configurable TTL for dashboard aggregation endpoints
2. THE System SHALL implement database query optimization with appropriate indexes for frequently accessed data patterns
3. THE System SHALL implement API rate limiting to prevent abuse
4. WHEN any dashboard view loads, THE System SHALL respond within 1 second even with 500+ AUs and 5000+ controls
