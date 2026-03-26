# Missing Requirements Document
## Framework Mandates Not Covered in Current Requirements.md

**Document Version:** 1.0  
**Date:** March 26, 2026  
**Status:** For Post-Demo Implementation Planning  
**Classification:** Internal - Product Roadmap

---

## Introduction

This document identifies requirements mandated by the ICICI Bank CRAF Framework (Dec 2022) and BRD (Feb 2026) that are **not currently captured** in the primary requirements.md file. These gaps represent important governance, data management, and operational processes critical for production deployment but intentionally deferred from the MVP1 (Demo-Ready) scope.

**Note:** MVP1 focuses on core calculations and dashboards suitable for C-Suite demonstration. These missing requirements are essential for enterprise production use and should be incorporated in MVP2/MVP3 releases.

---

## 1. GOVERNANCE & APPROVAL WORKFLOWS

### Requirement G1: Change Management for RCM (Risk & Control Matrix)

**Source:** CRAF Framework Section 4.1.6  
**Priority:** HIGH  
**Target Release:** MVP2  

**User Story:**  
As a Head of Assessment Unit, I want to submit RCM (Risk and Control Matrix) changes through a controlled workflow, so that regulatory changes, policy updates, and process modifications are systematically recorded, reviewed, and approved before implementation.

**Acceptance Criteria:**

1. WHEN new regulatory notifications, policy changes, or process updates trigger RCM modifications, THE System SHALL provide a change submission form capturing:
   - Change type (New Regulation, Policy Update, Process Change, Other)
   - Current RCM version
   - Proposed changes (risks/controls added/removed/modified)
   - Business justification for the change
   - Effective date
   - Attached reference documents

2. WHEN changes are submitted, THE System SHALL send notification to "Head - ICOFR and Compliance Monitoring team" for review and approval

3. WHEN reviewer approves the change, THE System SHALL:
   - Record approval timestamp and approver name
   - Mark RCM as updated
   - Notify impacted AUs of effective date
   - Create audit trail entry

4. WHEN a change is rejected, THE System SHALL:
   - Return to submitter with reviewer comments
   - Allow resubmission with revisions

5. WHEN an RCM is updated, THE System SHALL:
   - Trigger residual risk recalculation for affected controls
   - Update all dependent metrics (CQI, CPI, CER, residual risk)
   - Maintain version history (current, previous versions accessible)

6. THE System SHALL support periodic RCM reviews on configurable schedule:
   - Quarterly, bi-annual, or annual based on importance
   - Automatic workflow initiation with review due dates
   - Escalation if review not completed by deadline

### Requirement G2: Assessment Unit Periodic Review Workflow

**Source:** CRAF Framework Section 4.1.1  
**Priority:** MEDIUM  
**Target Release:** MVP2  

**User Story:**  
As the Head of ICOFR and Compliance Monitoring team, I want to conduct annual reviews of Assessment Unit definitions and organizational alignment, so that we can identify and implement necessary AU structure changes.

**Acceptance Criteria:**

1. WHEN any AU review period begins, THE System SHALL trigger automated workflow with:
   - Current AU listing with business area, theme, owner assignments
   - Previous period AU changes (for comparison)
   - Organizational changes (new business groups, restructuring, etc.)
   - Due date for review completion (30 days from trigger)

2. WHEN AU Head reviews their AUs, THE System SHALL allow:
   - Modification of AU description or business focus
   - Reassignment of AU owner
   - Flag for restructuring (split into multiple AUs or consolidation)
   - Add exceptional circumstances documentation (mid-year changes)

3. WHEN exceptional circumstances trigger mid-year AU review, THE System SHALL:
   - Accept emergency review submission
   - Require Chief Compliance Officer approval for emergency reviews
   - Allow effective dating of AU changes

4. WHEN AU review is complete, THE System SHALL:
   - Route to Head of Compliance & ICOFR Monitoring for approval
   - Upon approval, update AU master data
   - Recalculate risk assessments for modified AUs
   - Create audit trail of AU structural changes

### Requirement G3: Rating Override Approval Workflow (Multi-Tier)

**Source:** CRAF Framework Section - Rating Override  
**Priority:** HIGH  
**Target Release:** MVP2 (Enhancement to existing Req 18)  

**User Story:**  
As a GCCO, I want a structured approval workflow for rating overrides that includes multi-level validation and documentation of overriding factors, so that all rating changes are properly authorized and traceable.

**Acceptance Criteria (Enhancement to Requirement 18):**

1. WHEN a compliance officer or ICOFR officer proposes a rating override, THE System SHALL capture:
   - Original computed rating
   - Proposed overridden rating
   - Reason code (Industry Warning, Litigation, Expert Judgment, Other)
   - Detailed justification
   - Supporting documentation/attachments
   - Override factor explanation

2. WHEN override is submitted, THE System SHALL enforce two-tier validation:

   **First Level (AU Head Validation):**
   - Generate email alert to AU Head
   - Provide approval/rejection form
   - If rejected: return to proposer with feedback
   - If approved: move to second level

   **Second Level (Compliance Officer Validation):**
   - Generate email alert to Central Compliance Officer
   - Review for reasonableness and consistency
   - Final approval authority rests with GCCO
   - If rejected: return to AU Head with comments

3. WHEN override is approved, THE System SHALL:
   - Flag residual risk assessment with override indicator
   - Apply overridden rating to all downstream calculations
   - Require mandatory justification comment to be visible on related views
   - Create audit trail with all validation steps and commenters

4. WHEN override is applied to a risk rating, THE System SHALL:
   - Recalculate all aggregated residual risk metrics using overridden rating
   - Update enterprise-level and theme-level aggregations
   - Display override rationale in all drill-down views showing that rating

### Requirement G4: AU Head Disagreement & CCO Escalation

**Source:** CRAF Framework Section - Risk Assessment  
**Priority:** MEDIUM  
**Target Release:** MVP2  

**User Story:**  
As a Compliance Officer, I want to formally document disagreements with AU Heads on inherent risk assessments and escalate to the CCO for resolution, so that we have a structured process for resolving risk rating disputes.

**Acceptance Criteria:**

1. WHEN AU Head disagrees with calculated inherent risk assessment, THE System SHALL provide:
   - Disagreement submission form
   - Field to document "Points of Difference" (specific parameter scores disputed)
   - Rationale for disagreement
   - Supporting documentation
   - Suggested alternative assessment (optional)

2. WHEN disagreement is submitted, THE System SHALL:
   - Create escalation record with "Pending Resolution" status
   - Notify Compliance Officer and ICOFR Monitoring team member
   - Flag inherent risk assessment as "Under Dispute"

3. WHEN Compliance Officer reviews the disagreement, THE System SHALL allow:
   - Detailed comparison of calculated vs disputed assessment
   - Parameter-by-parameter analysis
   - Review of supporting data for each disputed parameter
   - Option to accept AU Head's assessment or maintain calculated rating

4. IF consensus not reached, THE System SHALL:
   - Escalate to Chief Compliance Officer automatically
   - Generate escalation summary with both perspectives
   - Send notification to CCO for final decision
   - Record CCO's decision and rationale

5. WHEN resolution is finalized, THE System SHALL:
   - Update inherent risk assessment with final agreed rating
   - Remove "Under Dispute" flag
   - Trigger downstream recalculation if rating changed
   - Create detailed audit trail of dispute resolution process

---

## 2. DATA MANAGEMENT & VALIDATION

### Requirement D1: Input Data Validation Rules

**Source:** CRAF Framework Annexure III  
**Priority:** HIGH  
**Target Release:** MVP2  

**User Story:**  
As a system administrator, I want the system to validate all input data against business rules before storage, so that calculated risk scores are based only on valid, consistent data.

**Acceptance Criteria:**

1. WHEN likelihood parameters are entered, THE Risk_Calculator SHALL validate:
   - **Volume Growth:** Percentage must be between -100% and +500% (cannot be negative for growth metric)
   - **Complexity:** System complexity and product complexity scores must each be in range [1-25]
   - **Regulatory Returns:** Count must be integer ≥ 0
   - **Compliance Breaches:** Count must be integer ≥ 0 (0, 1, or >1)
   - **Control Failures:** Count must be integer ≥ 0 (0, 1, or >1)
   - **Customer Complaints:** Count must be integer ≥ 0

2. WHEN likelihood parameters are entered, THE System SHALL validate:
   - At least 4 out of 6 parameters must have data (allow nulls for 2 parameters max)
   - If data missing, default assumption must be documented in compliance note
   - System must flag "Data Completeness" as partial if relying on defaults

3. WHEN impact parameters are entered, THE System SHALL validate:
   - Business Impact score must be in [5, 10, 15, 20, 25]
   - Media Coverage score must be in [5, 10, 15, 20, NA]
   - Financial Penalty score must be in [5, 25]
   - GL Impact score must be in [15, 20, 25, NA]
   - At least 2 out of 4 parameters must have non-null values

4. WHEN control design parameters are entered, THE System SHALL validate:
   - Monitoring Score ∈ {1, 3, 5}
   - Automation Score ∈ {1, 3, 5}
   - Control Type Score ∈ {1, 3, 5}
   - Documentation Score ∈ {1, 5}
   - Reject submissions with invalid scores with clear error message

5. WHEN control performance data is entered, THE System SHALL validate:
   - KCI Result ∈ {Pass, Fail, NA}
   - Self-Assessment Result ∈ {Pass, Pass with Exception, Fail, NA}
   - Control Testing Result ∈ {Pass, Pass with Exception, Fail, Not Tested}
   - If KCI linked = true, KCI Result cannot be NA
   - Reject invalid combinations with error messages

6. THE API SHALL return validation errors with:
   - HTTP 400 status code
   - Specific field that failed validation
   - Rule violated + acceptable values
   - Actionable error message for user
   - Example: `"field": "likelihood_volume_growth", "error": "Must be between -100 and +500", "invalid_value": "+750%"`

7. WHEN data fails validation, THE System SHALL:
   - Prevent storage in database
   - Log validation failure attempt with user/timestamp
   - Allow user to correct and resubmit
   - Optionally allow "override" if authorized (e.g., GCCO can force acceptance with documented reason)

### Requirement D2: Data Source Integration & Mapping

**Source:** CRAF Framework Annexure III - Details Parameter  
**Priority:** MEDIUM  
**Target Release:** MVP3  

**User Story:**  
As a Compliance Officer, I want the system to track and validate that all risk assessment input data comes from authorized data sources with known accuracy levels, so that we can demonstrate data integrity to auditors.

**Acceptance Criteria:**

1. WHEN risk assessment data is imported or manually entered, THE System SHALL capture:
   - Data source system name (Business Systems, BTG, CSQG, IAD, RBI, etc.)
   - Data extraction/submission date
   - Data owner (responsible party)
   - Validation status (Verified, Pending Verification, Failed Validation)
   - Last verified date

2. WHEN system is configured, THE Database SHALL maintain system master data:
   - **Business Systems:** Source for volume data, transaction counts
   - **Business Technology Group (BTG):** Source for system complexity, interfaces, tier classification
   - **Regulatory Reporting:** Source for regulatory returns count
   - **Internal Audit Department (IAD):** Source for audit findings, control failures
   - **RBI Inspection Team:** Source for inspection findings (via Audit Committee report)
   - **Compliance Monitoring Team:** Source for KCI results, compliance breaches
   - **Customer Service Quality Group (CSQG):** Source for customer complaint data (from FCRM system)
   - **ICOFR Team:** Source for control failure data, GL impact assessments
   - **Financial Accounting & Reporting Group (FARG):** Source for materiality calculations

3. WHEN data is loaded from external source, THE System SHALL:
   - Validate data comes from registered data source
   - Cross-check data freshness against expected loading frequency
   - Verify data format/schema matches expected structure
   - Log source, timestamp, and record count for audit trail

4. WHEN data source is unavailable or fails to provide data, THE System SHALL:
   - Flag assessment as "Data Integrity Issue: [Source Name] unavailable"
   - Allow manual entry with "Manual Override" flag
   - Require documentation of override reason
   - Alert compliance officer for follow-up

5. THE API SHALL expose data source audits with:
   - GET `/api/audit/data-sources` — Returns all data sources and last load timestamp
   - GET `/api/audit/data-source/{source_name}/history` — Returns data load history
   - GET `/api/assessment/risk/{au_id}/{period}/data-sources` — Shows which sources fed into this assessment

### Requirement D3: Data Freshness & Staleness Rules

**Source:** CRAF Framework Section - Residual Risk Assessment (Quarter Lag)  
**Priority:** MEDIUM  
**Target Release:** MVP2 (Enhancement to Req 37)  

**User Story:**  
As a Risk Officer, I want the system to enforce data freshness requirements and warn when assessment data exceeds staleness thresholds, so that we use current information for risk decisions.

**Acceptance Criteria (Enhancement to Requirement 37):**

1. WHEN risk assessment period is configured, THE System SHALL define:
   - **Assessment Data Lag:** Data must be from at least 1 quarter prior (e.g., March assessment uses Apr-Dec data)
   - **Data Freshness Threshold:** Warning if data older than 90 days
   - **Data Staleness Threshold:** Error if data older than 180 days (cannot proceed with assessment)
   - **Real-Time vs Periodic:** Real-time mode uses current data; periodic uses quarter-end data

2. WHEN user loads dashboard, THE Dashboard_Service SHALL display:
   - "Data As Of" indicator showing latest data date
   - "Last Calculated" timestamp showing when metrics were recomputed
   - Visual warning (amber) if data in "Warning Zone" (60-90 days old)
   - Visual alert (red) if data in "Stale Zone" (>90 days old)

3. WHEN data exceeds staleness threshold, THE System SHALL:
   - Display modal warning: "Risk data is [X] days old. Recommend recalculation."
   - Allow user to proceed with stale data but create audit log entry
   - Provide "Recalculate Now" button for immediate refresh (triggers new assessment period if needed)

4. WHEN assessment data sourcing is incomplete, THE System SHALL:
   - "Data Collection Status" widget showing:
     - Expected data sources for assessment
     - Received vs pending sources
     - Deadline for each source
   - Calculate "Data Completeness %" (received / total × 100)
   - Warning if completeness < 80%, error if < 60%

5. FOR periodic assessments, THE System SHALL:
   - Auto-trigger assessment during "January to March" window (quarterly)
   - Lock data collection after quarter-end (no changes to prior period data)
   - Allow "recalculation" of current period if new data arrives mid-quarter

### Requirement D4: Compliance Breach & Control Failure Repository

**Source:** CRAF Framework Likelihood Assessment Parameters  
**Priority:** HIGH  
**Target Release:** MVP2  

**User Story:**  
As a Compliance Officer, I want to record and track compliance breaches and control failures at the control level, so that we can map breaches to controls, identify trends, and demonstrate control effectiveness improvements.

**Acceptance Criteria:**

1. THE System SHALL provide "Compliance Breach" entity with attributes:
   - Breach ID (unique identifier)
   - Date discovered
   - AU/business unit affected
   - Control(s) that failed to prevent breach
   - Regulatory authority notified (RBI, etc.)
   - Breach description
   - Root cause
   - Severity (Critical, High, Medium, Low)
   - Remediation plan
   - Remediation completion date
   - Status (Open, Closed, Monitoring)
   - Created/modified audit trail

2. WHEN breach is recorded, THE System SHALL:
   - Allow attachment of supporting documentation (incident reports, RBI notices)
   - Map breach to specific control(s) and obligation(s)
   - Auto-link to relevant AU's control assessment
   - Flag control with "Associated Breach" indicator

3. WHEN breach count is needed for Likelihood parameter, THE System SHALL:
   - Query "compliance_breaches" table filtered by:
     - Status = Open (current period) or Closed (within 12 months)
     - Breach date within assessment period
     - AU matching current assessment
   - Count breaches and return count for likelihood scoring
   - Show breach list when drilling into Likelihood parameter

4. THE System SHALL expose API endpoints:
   - POST `/api/compliance-breaches` — Create new breach record
   - GET `/api/compliance-breaches?au_id={id}&period={period}` — List breaches for AU/period
   - GET `/api/compliance-breaches/{control_id}/controls` — Breaches linked to control
   - GET `/api/audit/breach-trends?au_id={id}` — Breach count trend over time

5. WHEN compliance officer reviews control performance, THE System SHALL display:
   - Controls with associated breaches highlighted
   - Breach frequency trend for control (last 12 months)
   - Correlation: "This control failed 3 times in 12 months, suggesting CPA = Low"

---

## 3. PROCESS MANAGEMENT & REVIEW CYCLES

### Requirement P1: Theme & Compliance Obligation Review Workflow

**Source:** CRAF Framework Section 4.1.3  
**Priority:** HIGH  
**Target Release:** MVP2  

**User Story:**  
As a CG Advisory Group Head, I want to conduct periodic reviews of regulatory themes and manage the annual approval workflow, so that our compliance obligation inventory reflects current RBI requirements and regulatory environment.

**Acceptance Criteria:**

1. WHEN annual theme review cycle begins, THE System SHALL:
   - Display current list of 21 regulatory themes (Annexure II)
   - Flag themes modified in previous 12 months
   - Show new RBI circular mappings
   - Trigger workflow with due date (e.g., 30 days)
   - Notify CG Advisory team of review initiation

2. WHEN user reviews themes, THE System SHALL allow:
   - Add new theme (requires description, RBI reference)
   - Modify theme description or scope
   - Flag theme for retirement (obsolete, no longer applicable)
   - Link theme to external events (Audit Finding, RBI Warning, Fraud Event, Legislation Change)

3. WHEN themes are modified, THE System SHALL:
   - Route modification list to CG Advisory Group Head for consolidation
   - CG Advisory Group Head presents to Group Compliance Officer for approval
   - Upon GCCO approval, escalate to Audit Committee (ACM)
   - Document: Decision date, approver, effective date

4. WHEN external event triggers mid-year theme review, THE System SHALL:
   - Allow emergency theme addition/modification
   - Require GCCO approval within 5 business days
   - Create "Event-Driven Review" audit trail entry
   - Notify all relevant AU heads of theme changes

5. WHEN theme review is completed, THE System SHALL:
   - Update theme master data
   - Recompute all AU-to-theme mappings
   - Recalculate inherent risk if themes changed (regulatory returns parameter affected)
   - Archive previous theme version for audit trail

---

### Requirement P2: KCI (Key Compliance Indicator) Master Data Management

**Source:** CRAF Framework CPA Section  
**Priority:** HIGH  
**Target Release:** MVP2  

**User Story:**  
As a Compliance Monitoring team member, I want to define, approve, and manage Key Compliance Indicators for controls, so that we have a structured approach to ongoing control monitoring.

**Acceptance Criteria:**

1. THE System SHALL support KCI Master Data with attributes:
   - KCI ID (unique identifier)
   - KCI Name (e.g., "Daily Cash Reconciliation", "Daily Fx Position Limit Monitoring")
   - Description & business rationale
   - Associated controls (one-to-many mapping)
   - Monitoring frequency (Daily, Weekly, Monthly, Quarterly)
   - Owner (responsible team)
   - Success metric/target (e.g., "100% reconciliation by EOD")
   - Failure threshold (triggers alert if >X% of days fail)
   - Status (Active, Inactive, Under Review)
   - Created date, last modified date

2. WHEN KCI is created/modified, THE System SHALL:
   - Require definition by Compliance Monitoring team
   - Route to CG Advisory team for approval
   - Document approval with approver name and timestamp
   - Upon activation, map to associated controls in control master data

3. WHEN KCI monitoring results are recorded, THE System SHALL:
   - Accept daily/periodic KCI result (Pass/Fail)
   - Calculate monitoring frequency compliance (e.g., "140/150 monitoring days passed = 93% pass rate")
   - Flag controls associated with failed KCIs
   - Show KCI failure trend over time

4. THE API SHALL expose KCI endpoints:
   - GET `/api/kci` — List all KCIs with approval status
   - POST `/api/kci` — Create KCI (requires definition + approval workflow)
   - GET `/api/kci/{kci_id}/results` — Historical KCI results
   - GET `/api/kci/{kci_id}/controls` — Controls monitored by this KCI
   - POST `/api/kci/{kci_id}/results` — Record KCI monitoring result

5. WHEN KCI monitoring shows degradation, THE System SHALL:
   - Flag controls with declining KCI pass rates
   - Trigger early warning indicator (Requirement from main BRD 22)
   - Generate KCI failure trend alerts to control owner

---

### Requirement P3: Regulatory Return Master Data & Tracking

**Source:** CRAF Framework Likelihood Assessment - Regulatory Returns Parameter  
**Priority:** MEDIUM  
**Target Release:** MVP2  

**User Story:**  
As a Compliance Officer, I want to maintain a master list of regulatory returns with deadline tracking and AU mappings, so that regulatory returns count feeds accurately into likelihood assessments.

**Acceptance Criteria:**

1. THE System SHALL maintain Regulatory Return Master Data:
   - Return ID (e.g., DSB-001, ALM-QTR, IRAC-M)
   - Return name (e.g., "Data Structure for Banks - Balance Sheet", "ALM Return - Quarterly")
   - RBI reference (e.g., "RBI/2023-24/078")
   - Submission frequency (Daily, Monthly, Quarterly, Annual)
   - Submission deadline (e.g., "7th of following month")
   - Data owner (e.g., "Financial Accounting & Reporting Group")
   - Applicable AUs (many-to-many mapping)
   - Return status (Active, Inactive, Under Review)

2. WHEN regulatory returns are configured for AUs, THE System SHALL:
   - Allow multiple returns per AU
   - Allow returns to apply to multiple AUs (many-to-many)
   - For each AU-Return pair:
     - Track whether return is applicable (Yes/No)
     - Count of returns applicable to AU (used for likelihood scoring)

3. WHEN likelihood is calculated, THE Risk_Calculator SHALL:
   - Query "regulatory_returns" table for AU's applicable returns
   - Count total applicable returns for AU
   - Score "Number of Regulatory Returns" parameter based on count

4. THE System SHALL provide audit dashboard:
   - Upcoming return deadlines by next 60 days
   - Return submission tracking (submitted on time, late, missed)
   - Missing return submissions requiring follow-up
   - Return submission history by AU

5. THE API SHALL expose endpoints:
   - GET `/api/regulatory-returns` — List all regulatory returns
   - GET `/api/assessment-units/{au_id}/regulatory-returns` — Returns applicable to AU
   - GET `/api/audit/regulatory-returns/dashboard` — Submission status dashboard

---

### Requirement P4: Theme-Based Review Plan Management

**Source:** CRAF Framework Section 4.1.3 - Theme-Based Review Plan  
**Priority:** MEDIUM  
**Target Release:** MVP2  

**User Story:**  
As a Compliance Group member, I want to create and track theme-based review plans that identify which themes/AUs will be reviewed and by whom, so that we have a risk-based testing approach proportionate to compliance risk.

**Acceptance Criteria:**

1. THE System SHALL support Theme-Based Review Plan with:
   - Review Plan ID (unique per year)
   - Review Plan Year
   - Theme selected for review
   - AUs within theme to be tested (may select subset)
   - Testing frequency (Quarterly, Semi-Annual, Annual)
   - Assigned reviewer (Internal Audit, Concurrent Auditor, Compliance team)
   - Planned start/completion dates
   - Testing scope/procedures
   - Plan status (Planned, In Progress, Completed, On Hold)

2. WHEN review plan is created, THE System SHALL:
   - Use "risk proportionality" approach: higher residual risk themes get more frequent review
   - Suggest frequency based on theme's current aggregate residual risk rating
   - Allow override of suggestion with documented justification
   - Route plan to CG Advisory Group Head for approval

3. WHEN theme review plan is approved, THE System SHALL:
   - Generate scheduled review task for assigned testing team
   - Create review checklist based on theme's obligations and controls
   - Set reminder notifications at plan start date

4. WHEN theme review is executed, THE System SHALL capture:
   - Actual review dates (vs planned dates)
   - Controls tested
   - Testing results summary (Pass/Fail breakdown)
   - Exceptions/findings identified
   - Reviewer name and sign-off

5. WHEN review results are recorded, THE System SHALL:
   - Map control testing results to individual controls (feeds CPA scoring)
   - Flag deviations if actual vs planned review scope differs
   - Generate review completion report with findings summary

6. THE API SHALL expose endpoints:
   - POST `/api/compliance-reviews/plans` — Create theme-based review plan
   - GET `/api/compliance-reviews/plans?year={year}` — List plans for year
   - GET `/api/compliance-reviews/plans/{plan_id}/results` — Review execution results
   - POST `/api/compliance-reviews/plans/{plan_id}/complete` — Mark review complete with results

---

## 4. MATERIALITY & ICOFR SPECIFICS

### Requirement M1: Significant Accounts Master Data

**Source:** CRAF Framework Section 4.2.3 - Materiality Assessment  
**Priority:** MEDIUM  
**Target Release:** MVP2  

**User Story:**  
As an ICOFR team member, I want to maintain a master list of significant accounts with GL hierarchy mapping and qualitative assessments, so that ICOFR controls focus on material accounts.

**Acceptance Criteria (Enhancement to Requirement 9 & 33):**

1. THE System SHALL maintain GL Hierarchy:
   - Level 1: GL (General Ledger) — Top-level account category (e.g., "Assets", "Liabilities", "Revenue")
   - Level 2: Head — Sub-category (e.g., "Current Assets", "Fixed Assets", "Interest Income")
   - Level 3: Account — Detailed account (e.g., "Cash and Cash Equivalents", "Interest Income - Retail Advances")
   - For each level: Account code, name, balance, YoY change %

2. WHEN materiality is calculated (per Req 9), THE System SHALL:
   - Identify "Significant Accounts" at Level 3 (Account level)
   - Apply quantitative thresholds:
     - Revenue items: Account balance > 5% of computed revenue materiality
     - Balance sheet items: Account balance > 0.5% of computed BS materiality
   - Identify additional significant accounts at Level 2 (Head level) if not caught at Level 3

3. FOR non-significant accounts and zero-balance accounts, THE System SHALL capture qualitative assessment:
   - Purpose of account (e.g., "Temporary suspense account", "Strategic investment reserve")
   - Nature of entries (one-time, recurring, unusual)
   - Volume and complexity of transactions
   - Susceptibility to fraud or error (Low/Medium/High)
   - Qualitative significance flag (Yes/No) with justification

4. WHEN significant accounts are identified, THE System SHALL:
   - Map each significant account to:
     - Product(s) (e.g., "Consumer Lending", "Deposits")
     - Business Group(s) (e.g., "Retail Banking", "Corporate Banking")
     - Process(es) (e.g., "Loan Origination", "Fund Transfer")
     - Assessment Unit(s)
   - Create audit trail showing how account was determined significant

5. WHEN ICOFR control assessment is performed, THE System SHALL:
   - Automatically flag controls related to significant accounts with "Material Account Control" indicator
   - These controls receive higher scrutiny in ICOFR testing
   - Controls over non-significant accounts may be tested with different intensity

6. THE API SHALL expose endpoints:
   - GET `/api/materiality/significant-accounts?period={id}` — List significant accounts
   - GET `/api/materiality/gl-hierarchy` — GL account hierarchy
   - GET `/api/materiality/accounts/{account_id}/mappings` — Product/Business Group/Process/AU mappings

---

## 5. REGULATORY & GOVERNANCE COMPLIANCE

### Requirement R1: Three Lines of Defense Integration

**Source:** CRAF Framework Overview - "Facilitate ongoing monitoring mechanism along with clearly defined roles and responsibilities across the three lines of defence"  
**Priority:** MEDIUM  
**Target Release:** MVP3  

**User Story:**  
As a Senior Management member, I want visibility into contributions from all three lines of defense (Business, Compliance/Risk, Internal Audit) to understand the layered control approach, so that I can assess overall risk management effectiveness.

**Acceptance Criteria:**

1. THE System SHALL define Three Lines of Defense:
   - **First Line:** Business Unit management and business unit self-assessment of controls
   - **Second Line:** Compliance team and Risk team monitoring and testing
   - **Third Line:** Internal Audit independent assurance

2. WHEN control performance is assessed, THE System SHALL track:
   - **First Line Contribution:** Self-assessment performed by AU head (per Req 12)
   - **Second Line Contribution:** KCI monitoring results (per Req 12), theme-based testing (per Req P3)
   - **Third Line Contribution:** Internal Audit testing results (feeds CPA per Req 13)

3. WHEN dashboard displays control performance, THE System SHALL show:
   - "Three Lines of Defense" breakdown view:
     - Control testing result source: Which line performed the test (IAD, Compliance, AU self-assessment)
     - Latest result from each applicable line
     - Discrepancies if lines disagree on control effectiveness (e.g., AU says Pass, IAD says Fail)

4. FOR each control, THE System SHALL track:
   - First Line opinion: AU head's assessment (Pass, Pass with Exception, Fail, Not Assessed)
   - Second Line monitoring: KCI pass rate or compliance review result
   - Third Line audit finding: IAD testing result or concurrent auditor finding
   - Scoring matrix: Majority rules, or highest severity finding determines rating

5. THE Dashboard_Service SHALL provide "Three Lines View":
   - Chart showing % of controls with agreement across all three lines
   - Controls where lines disagree (require investigation)
   - Risk areas where Third Line (IAD) findings are most critical
   - Trend: Improving vs degrading control effectiveness over time

6. THE API SHALL expose:
   - GET `/api/controls/{control_id}/three-lines` — View of all three lines assessments

---

### Requirement R2: RBI Regulatory Reference & Compliance Mapping

**Source:** CRAF Framework Annexure II & BRD Appendix A  
**Priority:** MEDIUM  
**Target Release:** MVP2  

**User Story:**  
As a Compliance Officer, I want to maintain RBI regulatory references and map them to themes and obligations, so that we can demonstrate regulatory coverage and respond to RBI inquiries about specific requirement compliance.

**Acceptance Criteria:**

1. THE System SHALL maintain RBI Regulation Master Data:
   - Regulation ID (e.g., "RBI/2021-22/25", "RBI Master Direction on Risk Management")
   - Regulation name and description
   - Effective date and end date (if applicable)
   - RBI Circular reference (if applicable)
   - Key requirements summary
   - Applicable entities (Bank, NBFC, Payment System Operator, etc.)
   - Risk category (Prudential, Governance, Compliance, Operational, etc.)

2. WHEN themes are mapped to regulations, THE System SHALL:
   - Map each theme to applicable RBI regulations
   - For each theme-regulation pair: link regulation and show compliance scope
   - Example: Theme "KYC/AML" maps to RBI/2016-17/11 with 14 compliance obligations

3. WHEN compliance obligations are created, THE System SHALL:
   - Link each obligation to underlying RBI regulation
   - Show regulation reference (RBI circular number, date)
   - Display requirement paragraph/section from regulation
   - Track regulation version (if updated, flag for reassessment)

4. WHEN RBI updates a regulation or issues new guidance, THE System SHALL:
   - Allow update of regulation master data
   - Flag affected themes and obligations
   - Trigger requirement review workflow (similar to G2)
   - Auto-escalate to Head of Compliance for impact assessment

5. THE Dashboard_Service SHALL provide "RBI Compliance Status" view (per BRD Req 23):
   - Overall compliance score: (Obligations in full compliance / Total obligations) × 100%
   - Breakdown by theme showing compliance status
   - Regulations with pending obligations
   - Mapping table: RBI Regulation → Theme → AU → Control

6. THE API SHALL expose endpoints:
   - GET `/api/regulations/rbi` — List all RBI regulations
   - GET `/api/regulations/rbi/{reg_id}/themes` — Themes covered by regulation
   - GET `/api/regulations/rbi/{reg_id}/obligations` — Obligations sourced from regulation
   - GET `/api/audit/regulatory-coverage` — Compliance coverage dashboard

---

## 6. HISTORICAL DATA & TRENDING

### Requirement H1: Assessment Period & Automated Triggering

**Source:** CRAF Framework - Risk Assessment "system generated basis auto-trigger during the quarter January to March every year"  
**Priority:** HIGH  
**Target Release:** MVP2  

**User Story:**  
As a system administrator, I want the system to automatically create assessment periods on a defined schedule and enforce data lag intervals, so that risk assessments follow the regulatory calendar without manual intervention.

**Acceptance Criteria (Enhancement to implicit requirement in main BRD):**

1. WHEN system is configured, THE System SHALL define assessment periods:
   - **Standard Annual Assessment Period:** January-March (Q4)
   - **Data Collection Period:** April prior year through December prior year (with 1-quarter lag)
   - **Assessment Completion Deadline:** March 31
   - **Results Use:** Plan Compliance testing and ICOFR monitoring for upcoming financial year

2. WHEN each new calendar year begins, THE System SHALL automatically:
   - Create new Assessment Period for current year (e.g., "FY2024-25 Assessment")
   - Lock prior year assessment period (no changes to historical data)
   - Set status to "Open" for current year
   - Trigger notifications to AU heads to begin data collection

3. WHEN assessment period ends (March 31), THE System SHALL:
   - Prevent further modifications to current period data
   - Lock period with status "Closed"
   - Archive all calculation results
   - Retain for audit trail and comparison purposes

4. WHEN recalculation is needed mid-year, THE System SHALL:
   - Create interim assessment periods (e.g., "FY2024-25 Mid-Year Refresh")
   - Allow targeted recalculation for specific AUs/themes affected by changes
   - Maintain both original and refreshed results for comparison

5. FOR data lag enforcement:
   - March assessment SHALL use data from April prior year through December prior year
   - Mid-year refresh (if triggered) SHALL not use current month data (must wait for month completion)
   - Real-time view mode (if enabled) CAN use current month data with "Preliminary" caveat

6. THE System SHALL expose period management APIs:
   - GET `/api/assessment-periods` — List all periods with status
   - GET `/api/assessment-periods/current` — Current active period
   - GET `/api/assessment-periods/{period_id}/lock-status` — Check if period is locked
   - POST `/api/assessment-periods/{period_id}/close` — Close period (admin only)

---

## 7. REPORTING & GOVERNANCE DOCUMENTATION

### Requirement REP1: Mandatory Justification for Ratings

**Source:** CRAF Framework CER Section - "A mandatory justification for this rating shall be provided"  
**Priority:** MEDIUM  
**Target Release:** MVP2  

**User Story:**  
As a Compliance Officer, I want to document mandatory justifications for risk ratings, so that all ratings have explained rationale for audit review and stakeholder communication.

**Acceptance Criteria:**

1. WHEN Control Environment Rating is finalized, THE System SHALL:
   - Require documented justification before rating becomes "Official"
   - Justification form captures:
     - Executive summary (1-2 sentences explaining CER rating)
     - Key drivers: Which CQI/CPI factors most influenced the rating
     - Assumptions made in assessment
     - Confidence level in rating (High/Medium/Low)
     - Limitations or areas for improvement
     - Approver name and review date

2. WHEN residual risk rating is finalized, THE System SHALL:
   - Require justification explaining relationship between inherent risk and control environment
   - Include statement: "Controls are [Sufficient/Insufficient] to mitigate inherent risk"
   - Flag any gaps between control design (CQI) and control performance (CPI) with explanation

3. WHEN rating override is applied (per G3), THE System SHALL:
   - Justification is mandatory (captured during override submission)
   - Display justification prominently in all views showing that rating
   - Require annual re-justification if override remains in place >12 months

4. WHEN risk assessment is presented to executives or auditors, THE System SHALL:
   - Display justification alongside rating
   - Provide option to print/export report including justification
   - Historical justifications retained for audit trail

5. THE Dashboard_Service SHALL provide reporting:
   - "Risk Ratings Without Justification" report (should be empty)
   - "Justifications Requiring Update" (older than 12 months)
   - Justification audit trail showing modifications and approval dates

---

## PRIORITY MATRIX & RELEASE ROADMAP

| Requirement ID | Title | Priority | MVP | Effort | Dependencies |
|---|---|---|---|---|---|
| G1 | Change Management for RCM | HIGH | MVP2 | 8 pts | D1, audit trail |
| G2 | AU Periodic Review | MEDIUM | MVP2 | 5 pts | RBAC |
| G3 | Rating Override Approval | HIGH | MVP2 | 6 pts | RBAC, audit trail |
| G4 | AU Head Escalation to CCO | MEDIUM | MVP2 | 4 pts | RBAC |
| D1 | Input Data Validation | HIGH | MVP2 | 6 pts | None |
| D2 | Data Source Integration | MEDIUM | MVP3 | 13 pts | D1, audit trail |
| D3 | Data Freshness Indicators | MEDIUM | MVP2 | 4 pts | D1 |
| D4 | Breach Repository | HIGH | MVP2 | 8 pts | None |
| P1 | Theme Review Workflow | HIGH | MVP2 | 7 pts | RBAC |
| P2 | KCI Master Data Mgmt | HIGH | MVP2 | 8 pts | None |
| P3 | Regulatory Returns Master | MEDIUM | MVP2 | 5 pts | None |
| P4 | Theme-Based Review Plan | MEDIUM | MVP2 | 10 pts | None |
| M1 | Significant Accounts Master | MEDIUM | MVP2 | 7 pts | None |
| R1 | Three Lines of Defense | MEDIUM | MVP3 | 6 pts | None |
| R2 | RBI Regulatory References | MEDIUM | MVP2 | 8 pts | None |
| H1 | Assessment Period Triggering | HIGH | MVP2 | 5 pts | None |
| REP1 | Mandatory Justifications | MEDIUM | MVP2 | 4 pts | None |

---

## SUMMARY

### Total Missing Requirements: 17

**By Release:**
- **MVP2 (Production Hardening):** 13 requirements
- **MVP3 (Enterprise Polish):** 2 requirements
- **Future:** 2 requirements

**By Category:**
- Governance & Approval Workflows: 4 requirements
- Data Management & Validation: 4 requirements
- Process Management & Review Cycles: 4 requirements
- Materiality & ICOFR: 1 requirement
- Regulatory & Governance: 2 requirements
- Historical Data & Trending: 1 requirement
- Reporting & Governance: 1 requirement

**Estimated MVP2 Effort:** ~90 story points over 4-5 sprints

### Critical Path for Production Readiness:

1. **Phase 1 (MVP1 - Demo Ready):** Core calculations + dashboards ✅
2. **Phase 2 (MVP2 - Production):** Governance workflows + data validation + process management
3. **Phase 3 (MVP3 - Enterprise):** Advanced reporting + integration + three lines visibility

---

## NEXT STEPS

1. **Post-Demo Review:** Use this document as roadmap for production hardening
2. **Stakeholder Alignment:** Present to GCCO and Head of Compliance for prioritization
3. **Roadmap Planning:** Schedule MVP2 planning session with development team
4. **Requirement Refinement:** Detailed acceptance criteria workshop for MVP2 requirements

---

**Document Owner:** Product Management  
**Last Updated:** March 26, 2026  
**Distribution:** Internal - Steering Committee, Product Team, Development Team
