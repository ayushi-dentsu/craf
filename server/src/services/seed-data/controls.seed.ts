/**
 * Seed data for 300+ controls mapped to 124 compliance obligations.
 * 2-4 controls per obligation with varied types and natures.
 * Requirements: 3.1, 27.4
 */
import { PrismaClient, Control, ComplianceObligation } from '@prisma/client';

interface ControlDef {
  code: string;
  name: string;
  description: string;
  obligationCode: string;
  controlType: string;       // Preventive | Detective
  controlNature: string;     // Manual | IT-driven | IT-based manual
  frequency: string;
  monitoringMechanism: string;
  isDocumented: boolean;
  ownerRole: string;
}

const CONTROLS: ControlDef[] = [
  // ── OBL001 Retail loan origination norms (AU001) ─────────────────────
  { code: 'CTL001', name: 'Credit Appraisal Checklist', description: 'Standardized credit appraisal checklist verified before loan sanction.', obligationCode: 'OBL001', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Loan', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Credit Manager' },
  { code: 'CTL002', name: 'Income Verification System', description: 'Automated income verification through ITR/bank statement analysis engine.', obligationCode: 'OBL001', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Loan', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Credit Analyst' },
  { code: 'CTL003', name: 'Post-Sanction Audit Sample', description: 'Monthly sample audit of sanctioned loans for compliance with appraisal norms.', obligationCode: 'OBL001', controlType: 'Detective', controlNature: 'Manual', frequency: 'Monthly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Internal Audit' },

  // ── OBL002 IRAC classification (AU001) ───────────────────────────────
  { code: 'CTL004', name: 'NPA Auto-Classification Engine', description: 'System-driven NPA classification based on DPD thresholds per IRAC norms.', obligationCode: 'OBL002', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'NPA Manager' },
  { code: 'CTL005', name: 'NPA Classification Review', description: 'Monthly review of NPA classification accuracy by credit risk team.', obligationCode: 'OBL002', controlType: 'Detective', controlNature: 'Manual', frequency: 'Monthly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Credit Risk Officer' },

  // ── OBL003 KYC verification (AU002) ──────────────────────────────────
  { code: 'CTL006', name: 'eKYC Verification System', description: 'Aadhaar-based eKYC verification integrated with account opening workflow.', obligationCode: 'OBL003', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Account', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Branch Manager' },
  { code: 'CTL007', name: 'KYC Document Verification Checklist', description: 'Manual verification of KYC documents against prescribed list before account activation.', obligationCode: 'OBL003', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Account', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Account Opening Officer' },
  { code: 'CTL008', name: 'KYC Compliance Audit', description: 'Quarterly audit of KYC compliance across branches with sample testing.', obligationCode: 'OBL003', controlType: 'Detective', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Compliance Officer' },

  // ── OBL004 Cash retention limits (AU002) ─────────────────────────────
  { code: 'CTL009', name: 'Cash Limit Monitoring System', description: 'Automated monitoring of branch cash holdings against prescribed limits.', obligationCode: 'OBL004', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Cash Officer' },
  { code: 'CTL010', name: 'Cash Verification by Branch Head', description: 'Daily physical cash verification by branch head with sign-off.', obligationCode: 'OBL004', controlType: 'Detective', controlNature: 'Manual', frequency: 'Daily', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Branch Manager' },

  // ── OBL005 Card issuance norms (AU003) ───────────────────────────────
  { code: 'CTL011', name: 'Card Eligibility Engine', description: 'Automated eligibility check based on credit score, income, and existing exposure.', obligationCode: 'OBL005', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Application', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Cards Product Manager' },
  { code: 'CTL012', name: 'Credit Limit Override Review', description: 'Manual review of credit limit overrides above threshold by senior management.', obligationCode: 'OBL005', controlType: 'Preventive', controlNature: 'IT-based manual', frequency: 'Per Override', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Cards Risk Manager' },

  // ── OBL006 Card transaction security (AU003) ─────────────────────────
  { code: 'CTL013', name: 'Transaction Alert System', description: 'Real-time SMS/email alerts for all card transactions above threshold.', obligationCode: 'OBL006', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Cards Technology Lead' },
  { code: 'CTL014', name: '2FA Authentication Engine', description: 'Two-factor authentication for all online card transactions via OTP.', obligationCode: 'OBL006', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Cards Security Lead' },
  { code: 'CTL015', name: 'Card Fraud Monitoring', description: 'Rule-based and ML-driven fraud detection for card transactions.', obligationCode: 'OBL006', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Real-time', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Fraud Analyst' },

  // ── OBL007 Digital lending compliance (AU004) ────────────────────────
  { code: 'CTL016', name: 'Digital Lending Disclosure Check', description: 'Automated disclosure of APR, fees, and terms on digital lending platform before disbursement.', obligationCode: 'OBL007', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Loan', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Digital Lending Head' },
  { code: 'CTL017', name: 'Digital Lending Compliance Review', description: 'Monthly compliance review of digital lending products against RBI guidelines.', obligationCode: 'OBL007', controlType: 'Detective', controlNature: 'Manual', frequency: 'Monthly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Compliance Officer' },

  // ── OBL008 Digital loan audit trail (AU004) ──────────────────────────
  { code: 'CTL018', name: 'Loan Disbursement Audit Trail', description: 'System-enforced audit trail for all digital loan disbursements with timestamp and user tracking.', obligationCode: 'OBL008', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Per Loan', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Digital Ops Lead' },
  { code: 'CTL019', name: 'Fund Flow Verification', description: 'Automated verification that loan funds are credited directly to borrower account.', obligationCode: 'OBL008', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Loan', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Partnership Manager' },

  // ── OBL009 Deposit insurance (AU005) ─────────────────────────────────
  { code: 'CTL020', name: 'DICGC Premium Calculation', description: 'Automated calculation and remittance of DICGC insurance premium.', obligationCode: 'OBL009', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Quarterly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Deposits Operations' },
  { code: 'CTL021', name: 'Deposit Coverage Reconciliation', description: 'Quarterly reconciliation of eligible deposits against DICGC coverage.', obligationCode: 'OBL009', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Quarterly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Deposits Head' },

  // ── OBL010 Daily Cash Reconciliation (AU006 — Demo obligation) ──────
  { code: 'CTL022', name: 'Daily Cash Reconciliation Control', description: 'IT-driven end-of-day cash reconciliation across all branches and ATM channels with automated exception reporting.', obligationCode: 'OBL010', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Operations Head' },
  { code: 'CTL023', name: 'Cash Exception Escalation', description: 'Automated escalation of unreconciled cash items exceeding ₹1 Lakh to operations head.', obligationCode: 'OBL010', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Cash Management Lead' },
  { code: 'CTL024', name: 'Branch Cash Surprise Verification', description: 'Unannounced physical cash verification at branches by regional operations team.', obligationCode: 'OBL010', controlType: 'Detective', controlNature: 'Manual', frequency: 'Monthly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Regional Operations Head' },

  // ── OBL011 Account opening documentation (AU006) ────────────────────
  { code: 'CTL025', name: 'Account Documentation Tracker', description: 'System-tracked documentation checklist with auto-reminders for pending documents.', obligationCode: 'OBL011', controlType: 'Preventive', controlNature: 'IT-based manual', frequency: 'Per Account', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Account Services Manager' },
  { code: 'CTL026', name: 'Documentation Completeness Audit', description: 'Monthly audit of account opening documentation completeness.', obligationCode: 'OBL011', controlType: 'Detective', controlNature: 'Manual', frequency: 'Monthly', monitoringMechanism: 'NA+Manual', isDocumented: false, ownerRole: 'Operations Audit' },

  // ── OBL012 Home loan LTV compliance (AU007) ─────────────────────────
  { code: 'CTL027', name: 'LTV Ratio System Check', description: 'Automated LTV ratio calculation and block if exceeding prescribed limits.', obligationCode: 'OBL012', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Loan', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Home Loan Manager' },
  { code: 'CTL028', name: 'Property Valuation Review', description: 'Independent property valuation by empanelled valuers with cross-verification.', obligationCode: 'OBL012', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Loan', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Valuation Officer' },

  // ── OBL013 NHB refinance (AU007) ────────────────────────────────────
  { code: 'CTL029', name: 'NHB Claim Documentation Check', description: 'Checklist-based verification of NHB refinance claim documentation.', obligationCode: 'OBL013', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Refinance Officer' },

  // ── OBL014 Personal loan pricing transparency (AU008) ───────────────
  { code: 'CTL030', name: 'Pricing Disclosure Engine', description: 'Automated display of all charges, APR, and terms before loan acceptance.', obligationCode: 'OBL014', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Loan', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Personal Loan Head' },
  { code: 'CTL031', name: 'Pricing Compliance Audit', description: 'Quarterly audit of personal loan pricing against approved rate card.', obligationCode: 'OBL014', controlType: 'Detective', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Compliance Officer' },

  // ── OBL015 Vehicle registration verification (AU009) ────────────────
  { code: 'CTL032', name: 'Registration Tracking System', description: 'System-tracked vehicle registration and hypothecation status with auto-reminders.', obligationCode: 'OBL015', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Per Loan', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Vehicle Loan Manager' },
  { code: 'CTL033', name: 'Hypothecation Verification', description: 'Monthly review of pending hypothecation registrations.', obligationCode: 'OBL015', controlType: 'Detective', controlNature: 'Manual', frequency: 'Monthly', monitoringMechanism: 'NA+Manual', isDocumented: false, ownerRole: 'Documentation Officer' },

  // ── OBL016 Education loan processing (AU010) ────────────────────────
  { code: 'CTL034', name: 'Education Loan TAT Tracker', description: 'System-tracked TAT for education loan applications with escalation triggers.', obligationCode: 'OBL016', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Per Application', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Education Loan Officer' },
  { code: 'CTL035', name: 'Rejection Reason Documentation', description: 'Mandatory documentation of rejection reasons communicated to applicant.', obligationCode: 'OBL016', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Application', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Education Loan Officer' },

  // ── OBL017 Wealth management suitability (AU011) ────────────────────
  { code: 'CTL036', name: 'Suitability Assessment Engine', description: 'Automated risk profiling and product suitability matching for wealth clients.', obligationCode: 'OBL017', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Wealth Advisor' },
  { code: 'CTL037', name: 'Suitability Override Review', description: 'Senior management review of suitability assessment overrides.', obligationCode: 'OBL017', controlType: 'Detective', controlNature: 'Manual', frequency: 'Per Override', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Wealth Management Head' },

  // ── OBL018 NRE/NRO FEMA compliance (AU012) ──────────────────────────
  { code: 'CTL038', name: 'FEMA Transaction Screening', description: 'Automated screening of NRI transactions against FEMA regulations and repatriation limits.', obligationCode: 'OBL018', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'NRI Banking Head' },
  { code: 'CTL039', name: 'NRI Account Compliance Review', description: 'Quarterly review of NRI account operations for FEMA compliance.', obligationCode: 'OBL018', controlType: 'Detective', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'FEMA Compliance Officer' },

  // ── OBL019 Recovery fair practices (AU013) ──────────────────────────
  { code: 'CTL040', name: 'Recovery Agent Code of Conduct', description: 'Mandatory code of conduct acknowledgment and training for all recovery agents.', obligationCode: 'OBL019', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Agent', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Collections Head' },
  { code: 'CTL041', name: 'Recovery Call Recording', description: 'Automated recording and sampling of recovery calls for compliance monitoring.', obligationCode: 'OBL019', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Ongoing', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Quality Assurance Lead' },

  // ── OBL020 Credit model validation (AU014) ──────────────────────────
  { code: 'CTL042', name: 'Model Validation Framework', description: 'Annual independent validation of credit scoring models with back-testing.', obligationCode: 'OBL020', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Annual', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Model Risk Manager' },
  { code: 'CTL043', name: 'Model Performance Monitoring', description: 'Monthly monitoring of model performance metrics (Gini, KS, PSI).', obligationCode: 'OBL020', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Monthly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Analytics Lead' },

  // ── OBL021 Bancassurance compliance (AU015) ─────────────────────────
  { code: 'CTL044', name: 'Insurance Needs Analysis', description: 'Mandatory needs analysis form completion before insurance product recommendation.', obligationCode: 'OBL021', controlType: 'Preventive', controlNature: 'IT-based manual', frequency: 'Per Sale', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Bancassurance Head' },
  { code: 'CTL045', name: 'Mis-selling Monitoring', description: 'Monthly review of insurance cancellations and complaints for mis-selling patterns.', obligationCode: 'OBL021', controlType: 'Detective', controlNature: 'Manual', frequency: 'Monthly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Compliance Officer' },

  // ── OBL022 UPI processing SLA (AU016) ───────────────────────────────
  { code: 'CTL046', name: 'UPI Uptime Monitoring', description: 'Real-time monitoring of UPI system uptime with automated failover.', obligationCode: 'OBL022', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Real-time', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Payments Head' },
  { code: 'CTL047', name: 'UPI SLA Dashboard', description: 'Real-time dashboard tracking UPI transaction success rates and response times.', obligationCode: 'OBL022', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Real-time', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'UPI Operations Lead' },

  // ── OBL023 UPI dispute resolution (AU016) ───────────────────────────
  { code: 'CTL048', name: 'UPI Dispute Resolution System', description: 'Automated dispute tracking and resolution within NPCI prescribed TAT.', obligationCode: 'OBL023', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Per Dispute', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Dispute Resolution Lead' },
  { code: 'CTL049', name: 'Failed Transaction Auto-Reversal', description: 'Automated reversal of failed UPI transactions within T+5 working days.', obligationCode: 'OBL023', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Payments Operations' },

  // ── OBL024 Gold loan valuation (AU017) ──────────────────────────────
  { code: 'CTL050', name: 'Gold Purity Verification', description: 'Mandatory gold purity testing by certified appraiser before loan sanction.', obligationCode: 'OBL024', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Loan', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Gold Loan Manager' },
  { code: 'CTL051', name: 'Gold LTV Monitoring', description: 'Daily monitoring of gold loan LTV against market price fluctuations.', obligationCode: 'OBL024', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Gold Loan Risk Officer' },

  // ── OBL025 Microfinance assessment (AU018) ──────────────────────────
  { code: 'CTL052', name: 'Household Income Assessment', description: 'Field-level household income assessment before microfinance disbursement.', obligationCode: 'OBL025', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Loan', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Field Officer' },
  { code: 'CTL053', name: 'Indebtedness Check System', description: 'Automated check of total indebtedness through credit bureau integration.', obligationCode: 'OBL025', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Loan', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Microfinance Head' },

  // ── OBL026 Product approval (AU019) ─────────────────────────────────
  { code: 'CTL054', name: 'Product Approval Workflow', description: 'System-enforced product approval workflow with compliance sign-off.', obligationCode: 'OBL026', controlType: 'Preventive', controlNature: 'IT-based manual', frequency: 'Per Product', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Product Head' },
  { code: 'CTL055', name: 'Regulatory Impact Assessment', description: 'Mandatory regulatory impact assessment for all new products.', obligationCode: 'OBL026', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Product', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Compliance Officer' },

  // ── OBL027 Customer complaint TAT (AU020) ───────────────────────────
  { code: 'CTL056', name: 'Complaint Management System', description: 'Centralized complaint tracking with auto-escalation on TAT breach.', obligationCode: 'OBL027', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Per Complaint', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Service Quality Head' },
  { code: 'CTL057', name: 'Complaint Resolution Quality Check', description: 'Sample review of resolved complaints for quality and customer satisfaction.', obligationCode: 'OBL027', controlType: 'Detective', controlNature: 'Manual', frequency: 'Weekly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Quality Assurance Lead' },

  // ── OBL028 ATM cash availability (AU021) ────────────────────────────
  { code: 'CTL058', name: 'ATM Cash Forecasting System', description: 'ML-based cash demand forecasting for ATM replenishment optimization.', obligationCode: 'OBL028', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'ATM Operations Head' },
  { code: 'CTL059', name: 'ATM Uptime Monitoring', description: 'Real-time ATM uptime monitoring with automated alerts for downtime.', obligationCode: 'OBL028', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Real-time', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'ATM Monitoring Lead' },

  // ── OBL029 Agriculture PSL target (AU022) ───────────────────────────
  { code: 'CTL060', name: 'PSL Target Tracking Dashboard', description: 'Real-time dashboard tracking agriculture lending against PSL sub-targets.', obligationCode: 'OBL029', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Agri Banking Head' },
  { code: 'CTL061', name: 'Agri Loan Classification Review', description: 'Monthly review of agriculture loan classification for PSL eligibility.', obligationCode: 'OBL029', controlType: 'Detective', controlNature: 'Manual', frequency: 'Monthly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'PSL Compliance Officer' },

  // ── OBL030 MF suitability (AU023) ───────────────────────────────────
  { code: 'CTL062', name: 'Risk Profiling Questionnaire', description: 'Mandatory risk profiling before mutual fund recommendation.', obligationCode: 'OBL030', controlType: 'Preventive', controlNature: 'IT-based manual', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Distribution Head' },
  { code: 'CTL063', name: 'Product Suitability Mismatch Alert', description: 'System alert when recommended product does not match customer risk profile.', obligationCode: 'OBL030', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Compliance Officer' },

  // ── OBL031 Model inventory (AU024) ──────────────────────────────────
  { code: 'CTL064', name: 'Model Inventory Register', description: 'Centralized model inventory with validation status and next review dates.', obligationCode: 'OBL031', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Quarterly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Analytics Head' },
  { code: 'CTL065', name: 'Model Validation Schedule', description: 'Annual model validation schedule with independent review team assignment.', obligationCode: 'OBL031', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Annual', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Model Risk Manager' },

  // ── OBL032 LAP valuation (AU025) ────────────────────────────────────
  { code: 'CTL066', name: 'Property Valuation System', description: 'Empanelled valuer assignment and valuation report tracking system.', obligationCode: 'OBL032', controlType: 'Preventive', controlNature: 'IT-based manual', frequency: 'Per Loan', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'LAP Manager' },
  { code: 'CTL067', name: 'LTV Compliance Check', description: 'Automated LTV ratio check against prescribed limits before disbursement.', obligationCode: 'OBL032', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Loan', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Credit Officer' },

  // ── OBL033 Large exposure limit (AU026) ─────────────────────────────
  { code: 'CTL068', name: 'Exposure Limit Monitoring System', description: 'Real-time monitoring of single and group borrower exposure against Tier 1 capital limits.', obligationCode: 'OBL033', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Real-time', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Credit Risk Head' },
  { code: 'CTL069', name: 'Large Exposure Committee Review', description: 'Committee review of all exposures approaching 15% of Tier 1 capital.', obligationCode: 'OBL033', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Proposal', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Credit Committee' },

  // ── OBL034 Large exposure reporting (AU026) ─────────────────────────
  { code: 'CTL070', name: 'Large Exposure Report Generator', description: 'Automated generation and submission of large exposure reports to RBI.', obligationCode: 'OBL034', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Monthly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Regulatory Reporting' },

  // ── OBL035 Working capital assessment (AU027) ───────────────────────
  { code: 'CTL071', name: 'WC Assessment Template', description: 'Standardized working capital assessment template with Turnover/MPBF method.', obligationCode: 'OBL035', controlType: 'Preventive', controlNature: 'IT-based manual', frequency: 'Per Review', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Credit Analyst' },
  { code: 'CTL072', name: 'WC Utilization Monitoring', description: 'Monthly monitoring of working capital utilization against sanctioned limits.', obligationCode: 'OBL035', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Monthly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Relationship Manager' },

  // ── OBL036 LC Issuance Compliance (AU028 — Demo: CQA=1 scenario) ────
  { code: 'CTL073', name: 'LC Issuance Maker-Checker', description: 'Maker-checker verification for all LC issuances ensuring UCPDC 600 compliance and credit approval matrix adherence.', obligationCode: 'OBL036', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Transaction', monitoringMechanism: 'NA+Manual', isDocumented: false, ownerRole: 'Trade Finance Officer' },
  { code: 'CTL074', name: 'LC FEMA Compliance Check', description: 'Automated FEMA regulation check for all LC issuances including eBRC verification.', obligationCode: 'OBL036', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'FEMA Compliance Officer' },
  { code: 'CTL075', name: 'LC Post-Issuance Review', description: 'Weekly review of issued LCs for documentation completeness and compliance.', obligationCode: 'OBL036', controlType: 'Detective', controlNature: 'Manual', frequency: 'Weekly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Trade Finance Head' },

  // ── OBL037 FEMA trade finance (AU028) ───────────────────────────────
  { code: 'CTL076', name: 'eBRC Filing Tracker', description: 'System-tracked eBRC filing status with auto-reminders for pending filings.', obligationCode: 'OBL037', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Trade Ops Lead' },
  { code: 'CTL077', name: 'EDPMS Reporting Control', description: 'Automated EDPMS reporting for all export/import transactions.', obligationCode: 'OBL037', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'FEMA Compliance Officer' },

  // ── OBL038 Securitisation (AU029) ───────────────────────────────────
  { code: 'CTL078', name: 'Securitisation Compliance Check', description: 'Pre-transaction compliance check for MRR and MHP requirements.', obligationCode: 'OBL038', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Transaction', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Structured Finance Head' },
  { code: 'CTL079', name: 'Securitisation Pool Monitoring', description: 'Monthly monitoring of securitised pool performance and trigger events.', obligationCode: 'OBL038', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Monthly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Pool Manager' },

  // ── OBL039 CRILC reporting (AU030) ──────────────────────────────────
  { code: 'CTL080', name: 'CRILC Data Extraction', description: 'Automated extraction of borrower data for CRILC reporting.', obligationCode: 'OBL039', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Monthly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Credit Risk Head' },
  { code: 'CTL081', name: 'CRILC Data Validation', description: 'Manual validation of CRILC data before submission to RBI.', obligationCode: 'OBL039', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Monthly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Regulatory Reporting Lead' },

  // ── OBL040 RTGS/NEFT processing (AU031) ─────────────────────────────
  { code: 'CTL082', name: 'Payment STP Engine', description: 'Straight-through processing engine for RTGS/NEFT with auto-validation.', obligationCode: 'OBL040', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Transaction Banking Head' },
  { code: 'CTL083', name: 'Payment STP Rate Monitoring', description: 'Daily monitoring of STP rates with root cause analysis for failures.', obligationCode: 'OBL040', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Payments Operations' },

  // ── OBL041 SCF agreements (AU032) ───────────────────────────────────
  { code: 'CTL084', name: 'SCF Agreement Review', description: 'Legal and compliance review of anchor-dealer agreements before program launch.', obligationCode: 'OBL041', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Program', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'SCF Head' },
  { code: 'CTL085', name: 'SCF Credit Risk Assessment', description: 'Automated credit risk scoring for SCF dealer onboarding.', obligationCode: 'OBL041', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Dealer', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'SCF Risk Manager' },

  // ── OBL042 MSME loan processing (AU033) ─────────────────────────────
  { code: 'CTL086', name: 'MSME Loan Processing Engine', description: 'Automated loan processing with 59-minute decision engine for eligible MSMEs.', obligationCode: 'OBL042', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Application', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'SME Head' },
  { code: 'CTL087', name: 'MSME TAT Monitoring', description: 'Dashboard tracking MSME loan processing TAT against 59-minute benchmark.', obligationCode: 'OBL042', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'SME Operations Lead' },

  // ── OBL043 Corporate deposit rates (AU034) ──────────────────────────
  { code: 'CTL088', name: 'Deposit Rate Compliance Check', description: 'Automated check of corporate deposit rates against RBI directives.', obligationCode: 'OBL043', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Deposit', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Corporate Deposits Head' },
  { code: 'CTL089', name: 'Bulk Deposit Documentation Review', description: 'Review of documentation for bulk deposits above threshold.', obligationCode: 'OBL043', controlType: 'Detective', controlNature: 'Manual', frequency: 'Per Deposit', monitoringMechanism: 'NA+Manual', isDocumented: false, ownerRole: 'Deposits Compliance' },

  // ── OBL044 IPO due diligence (AU035) ────────────────────────────────
  { code: 'CTL090', name: 'IPO Due Diligence Checklist', description: 'Comprehensive due diligence checklist for IPO mandates per SEBI requirements.', obligationCode: 'OBL044', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Deal', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'IB Head' },
  { code: 'CTL091', name: 'Disclosure Compliance Review', description: 'Legal review of DRHP/RHP disclosures for SEBI compliance.', obligationCode: 'OBL044', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Deal', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Legal Counsel' },

  // ── OBL045 Debenture trustee monitoring (AU036) ─────────────────────
  { code: 'CTL092', name: 'Covenant Monitoring System', description: 'Automated tracking of debenture issuer covenant compliance.', obligationCode: 'OBL045', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Quarterly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Trustee Head' },
  { code: 'CTL093', name: 'Default Reporting Workflow', description: 'Automated workflow for reporting issuer defaults to SEBI within prescribed timelines.', obligationCode: 'OBL045', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Per Event', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Trustee Compliance' },

  // ── OBL046 Stressed asset resolution (AU037) ────────────────────────
  { code: 'CTL094', name: 'Resolution Plan Tracker', description: 'System-tracked resolution plan milestones with 180-day timeline monitoring.', obligationCode: 'OBL046', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Per Case', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Recovery Head' },
  { code: 'CTL095', name: 'ICA Compliance Check', description: 'Compliance verification of inter-creditor agreement terms during resolution.', obligationCode: 'OBL046', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Case', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Legal Officer' },

  // ── OBL047 Pension disbursement (AU038) ─────────────────────────────
  { code: 'CTL096', name: 'Pension Disbursement System', description: 'Automated pension disbursement with life certificate verification.', obligationCode: 'OBL047', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Monthly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Govt Banking Head' },
  { code: 'CTL097', name: 'Government Account Reconciliation', description: 'Daily reconciliation of government account transactions with treasury.', obligationCode: 'OBL047', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Reconciliation Officer' },

  // ── OBL048 Correspondent banking due diligence (AU039) ──────────────
  { code: 'CTL098', name: 'CB Due Diligence Review', description: 'Annual due diligence review of correspondent banking relationships.', obligationCode: 'OBL048', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Annual', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'CB Head' },
  { code: 'CTL099', name: 'Nostro Account Reconciliation', description: 'Daily reconciliation of nostro accounts with correspondent banks.', obligationCode: 'OBL048', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Reconciliation Lead' },

  // ── OBL049 Commodity collateral (AU040) ─────────────────────────────
  { code: 'CTL100', name: 'Warehouse Receipt Verification', description: 'Physical verification of warehouse receipts and commodity stock.', obligationCode: 'OBL049', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Monthly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Commodity Finance Head' },
  { code: 'CTL101', name: 'Commodity Price Monitoring', description: 'Daily monitoring of commodity prices for collateral adequacy.', obligationCode: 'OBL049', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Risk Analyst' },

  // ── OBL050 Corporate product approval (AU041) ───────────────────────
  { code: 'CTL102', name: 'Corporate Product Governance', description: 'Board-level product approval workflow with compliance and risk sign-off.', obligationCode: 'OBL050', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Product', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Product Development Head' },

  // ── OBL051 Consortium lending (AU042) ───────────────────────────────
  { code: 'CTL103', name: 'Consortium Information Sharing', description: 'Automated information sharing with consortium members per RBI guidelines.', obligationCode: 'OBL051', controlType: 'Preventive', controlNature: 'IT-based manual', frequency: 'Per Deal', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Syndication Head' },

  // ── OBL052 CRE exposure limits (AU043) ──────────────────────────────
  { code: 'CTL104', name: 'CRE Exposure Monitoring', description: 'Automated monitoring of CRE exposure against sectoral limits.', obligationCode: 'OBL052', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Monthly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'RE Finance Head' },
  { code: 'CTL105', name: 'CRE Risk Weight Compliance', description: 'Quarterly review of CRE risk weights per RBI prudential norms.', obligationCode: 'OBL052', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Quarterly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Risk Officer' },

  // ── OBL053 Infrastructure project appraisal (AU044) ─────────────────
  { code: 'CTL106', name: 'Technical Evaluation Report', description: 'Independent technical evaluation by empanelled consultants for infra projects.', obligationCode: 'OBL053', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Project', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Infra Finance Head' },
  { code: 'CTL107', name: 'Environmental Clearance Tracker', description: 'System-tracked environmental and regulatory clearance status.', obligationCode: 'OBL053', controlType: 'Preventive', controlNature: 'IT-based manual', frequency: 'Per Project', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Project Manager' },

  // ── OBL054 NBFC exposure (AU045) ────────────────────────────────────
  { code: 'CTL108', name: 'NBFC Exposure Dashboard', description: 'Real-time dashboard tracking NBFC sector exposure concentration.', obligationCode: 'OBL054', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'FIG Head' },
  { code: 'CTL109', name: 'NBFC Credit Review', description: 'Quarterly credit review of NBFC counterparties with rating migration tracking.', obligationCode: 'OBL054', controlType: 'Detective', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Credit Analyst' },

  // ── OBL055 VaR limits (AU046) ───────────────────────────────────────
  { code: 'CTL110', name: 'VaR Limit Monitoring System', description: 'Real-time VaR computation and limit monitoring with automated breach alerts.', obligationCode: 'OBL055', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Real-time', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Markets Head' },
  { code: 'CTL111', name: 'Daily MTM Reconciliation', description: 'End-of-day mark-to-market reconciliation of all trading positions.', obligationCode: 'OBL055', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Middle Office' },
  { code: 'CTL112', name: 'Trading Limit Breach Escalation', description: 'Immediate escalation of VaR limit breaches to CRO and board risk committee.', obligationCode: 'OBL055', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Per Breach', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Risk Manager' },

  // ── OBL056 Proprietary trading limits (AU047) ───────────────────────
  { code: 'CTL113', name: 'Stop-Loss Trigger System', description: 'Automated stop-loss triggers for proprietary trading positions.', obligationCode: 'OBL056', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Real-time', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Prop Trading Head' },
  { code: 'CTL114', name: 'Prop Book Position Review', description: 'Daily review of proprietary book positions by treasury head.', obligationCode: 'OBL056', controlType: 'Detective', controlNature: 'Manual', frequency: 'Daily', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Treasury Head' },

  // ── OBL057 P&L verification (AU048) ─────────────────────────────────
  { code: 'CTL115', name: 'Independent P&L Verification', description: 'Middle office independent P&L computation and verification against front office.', obligationCode: 'OBL057', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Treasury Controller' },
  { code: 'CTL116', name: 'Limit Breach Escalation Protocol', description: 'Automated escalation of limit breaches within 30 minutes to designated officers.', obligationCode: 'OBL057', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Per Breach', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Risk Officer' },

  // ── OBL058 Forex FEMA compliance (AU049) ────────────────────────────
  { code: 'CTL117', name: 'Forex Transaction FEMA Check', description: 'Automated FEMA compliance check for all forex transactions.', obligationCode: 'OBL058', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Forex Desk Head' },
  { code: 'CTL118', name: 'AD License Compliance Review', description: 'Quarterly review of AD Category I license compliance.', obligationCode: 'OBL058', controlType: 'Detective', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'FEMA Compliance' },

  // ── OBL059 LCR/NSFR maintenance (AU050) ─────────────────────────────
  { code: 'CTL119', name: 'LCR Computation Engine', description: 'Automated daily LCR/NSFR computation with threshold alerts.', obligationCode: 'OBL059', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'ALM Head' },
  { code: 'CTL120', name: 'Liquidity Stress Testing', description: 'Monthly liquidity stress testing under multiple scenarios.', obligationCode: 'OBL059', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Monthly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Liquidity Risk Manager' },

  // ── OBL060 Structural liquidity statement (AU050) ───────────────────
  { code: 'CTL121', name: 'SLS Report Generator', description: 'Automated structural liquidity statement generation with maturity bucket analysis.', obligationCode: 'OBL060', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Fortnightly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'ALM Analyst' },

  // ── OBL061 ISDA documentation (AU051) ───────────────────────────────
  { code: 'CTL122', name: 'ISDA Documentation Tracker', description: 'System-tracked ISDA master agreement and CSA documentation status.', obligationCode: 'OBL061', controlType: 'Preventive', controlNature: 'IT-based manual', frequency: 'Per Counterparty', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Derivatives Head' },
  { code: 'CTL123', name: 'Margin Requirement Monitor', description: 'Automated initial and variation margin computation and call generation.', obligationCode: 'OBL061', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Collateral Manager' },

  // ── OBL062 Call money limits (AU052) ────────────────────────────────
  { code: 'CTL124', name: 'Call Money Limit System', description: 'Automated enforcement of call money borrowing/lending limits.', obligationCode: 'OBL062', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Money Market Head' },
  { code: 'CTL125', name: 'CCIL Reporting Control', description: 'Same-day reporting of money market transactions to CCIL.', obligationCode: 'OBL062', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Treasury Ops' },

  // ── OBL063 Investment classification (AU053) ────────────────────────
  { code: 'CTL126', name: 'Investment Classification Engine', description: 'Automated investment portfolio classification per RBI norms.', obligationCode: 'OBL063', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Investment Head' },
  { code: 'CTL127', name: 'Portfolio Reclassification Review', description: 'Quarterly review of investment reclassifications with compliance sign-off.', obligationCode: 'OBL063', controlType: 'Detective', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Investment Compliance' },

  // ── OBL064 SLR maintenance (AU053) ──────────────────────────────────
  { code: 'CTL128', name: 'SLR Monitoring System', description: 'Real-time SLR monitoring against NDTL with automated alerts.', obligationCode: 'OBL064', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'SLR Compliance Officer' },
  { code: 'CTL129', name: 'SLR Reporting to RBI', description: 'Automated daily SLR reporting to RBI.', obligationCode: 'OBL064', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Regulatory Reporting' },

  // ── OBL065 Treasury product suitability (AU054) ─────────────────────
  { code: 'CTL130', name: 'Corporate Suitability Assessment', description: 'Suitability assessment for corporate treasury product sales.', obligationCode: 'OBL065', controlType: 'Preventive', controlNature: 'IT-based manual', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Treasury Sales Head' },

  // ── OBL066 Settlement timelines (AU055) ─────────────────────────────
  { code: 'CTL131', name: 'Settlement STP Engine', description: 'Automated settlement processing with T+1/T+2 compliance tracking.', obligationCode: 'OBL066', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Treasury Ops Head' },
  { code: 'CTL132', name: 'Settlement Failure Monitoring', description: 'Daily monitoring of settlement failures with root cause analysis.', obligationCode: 'OBL066', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Settlement Lead' },

  // ── OBL067 Equity insider trading (AU056) ───────────────────────────
  { code: 'CTL133', name: 'Insider Trading Surveillance', description: 'Automated surveillance of equity trades against insider trading regulations.', obligationCode: 'OBL067', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Equity Trading Head' },
  { code: 'CTL134', name: 'Position Limit Monitoring', description: 'Real-time monitoring of equity position limits per SEBI regulations.', obligationCode: 'OBL067', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Real-time', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Risk Manager' },

  // ── OBL068 Commodity position limits (AU057) ────────────────────────
  { code: 'CTL135', name: 'Commodity Position Limit System', description: 'Automated position limit enforcement for commodity derivatives.', obligationCode: 'OBL068', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Real-time', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Commodities Head' },
  { code: 'CTL136', name: 'Commodity Margin Monitoring', description: 'Daily margin adequacy monitoring for commodity positions.', obligationCode: 'OBL068', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Risk Analyst' },

  // ── OBL069 VaR/stressed VaR reporting (AU058) ──────────────────────
  { code: 'CTL137', name: 'Market Risk Computation Engine', description: 'Automated VaR, stressed VaR, and IRC computation per Basel III.', obligationCode: 'OBL069', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Market Risk Head' },
  { code: 'CTL138', name: 'Back-Testing Framework', description: 'Daily back-testing of VaR models with exception tracking.', obligationCode: 'OBL069', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Model Validation Lead' },

  // ── OBL070 Collateral margin calls (AU059) ──────────────────────────
  { code: 'CTL139', name: 'Margin Call Engine', description: 'Automated daily margin call computation and issuance.', obligationCode: 'OBL070', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Collateral Manager' },
  { code: 'CTL140', name: 'Collateral Valuation System', description: 'Daily mark-to-market valuation of collateral holdings.', obligationCode: 'OBL070', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Valuation Analyst' },

  // ── OBL071 Treasury DR capability (AU060) ───────────────────────────
  { code: 'CTL141', name: 'Treasury DR Testing', description: 'Quarterly DR drill for treasury systems with RPO/RTO validation.', obligationCode: 'OBL071', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Quarterly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Treasury Tech Head' },
  { code: 'CTL142', name: 'Treasury System Monitoring', description: 'Real-time monitoring of treasury system availability and performance.', obligationCode: 'OBL071', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Real-time', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'IT Operations' },

  // ── OBL072 IT governance (AU061) ────────────────────────────────────
  { code: 'CTL143', name: 'IT Strategy Review', description: 'Annual board-level review of IT strategy and governance framework.', obligationCode: 'OBL072', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Annual', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'CTO' },
  { code: 'CTL144', name: 'IT Risk Assessment', description: 'Quarterly IT risk assessment covering all critical applications.', obligationCode: 'OBL072', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Quarterly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'IT Risk Manager' },

  // ── OBL073 Patch management (AU061) ─────────────────────────────────
  { code: 'CTL145', name: 'Patch Management System', description: 'Automated patch deployment and compliance tracking for critical systems.', obligationCode: 'OBL073', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Ongoing', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'IT Security Lead' },
  { code: 'CTL146', name: 'Patch Compliance Dashboard', description: 'Real-time dashboard tracking patch compliance across all systems.', obligationCode: 'OBL073', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'IT Operations' },

  // ── OBL074 Compliance report (AU062) ────────────────────────────────
  { code: 'CTL147', name: 'Compliance Risk Assessment', description: 'Annual compliance risk assessment across all business lines.', obligationCode: 'OBL074', controlType: 'Detective', controlNature: 'Manual', frequency: 'Annual', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Chief Compliance Officer' },
  { code: 'CTL148', name: 'Compliance MIS Dashboard', description: 'Monthly compliance MIS with breach tracking and remediation status.', obligationCode: 'OBL074', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Monthly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Compliance Analyst' },

  // ── OBL075 Internal audit (AU063) ───────────────────────────────────
  { code: 'CTL149', name: 'Risk-Based Audit Planning', description: 'Annual risk-based audit plan with ACB approval.', obligationCode: 'OBL075', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Annual', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Chief Audit Executive' },
  { code: 'CTL150', name: 'Audit Finding Tracker', description: 'System-tracked audit findings with remediation timelines and escalation.', obligationCode: 'OBL075', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Per Audit', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Audit Manager' },

  // ── OBL076 Compensation policy (AU064) ──────────────────────────────
  { code: 'CTL151', name: 'Compensation Policy Review', description: 'Annual review of compensation policy against RBI guidelines.', obligationCode: 'OBL076', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Annual', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'HR Head' },
  { code: 'CTL152', name: 'Variable Pay Clawback Tracker', description: 'System-tracked clawback provisions for variable pay components.', obligationCode: 'OBL076', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Annual', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Compensation Manager' },

  // ── OBL077 Legal opinion maintenance (AU065) ────────────────────────
  { code: 'CTL153', name: 'Legal Opinion Register', description: 'Centralized register of legal opinions with annual review schedule.', obligationCode: 'OBL077', controlType: 'Detective', controlNature: 'Manual', frequency: 'Annual', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Legal Head' },
  { code: 'CTL154', name: 'Product Legal Review', description: 'Mandatory legal review for all new and modified banking products.', obligationCode: 'OBL077', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Product', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Legal Counsel' },

  // ── OBL078 Financial reporting (AU066) ──────────────────────────────
  { code: 'CTL155', name: 'Ind AS Compliance Engine', description: 'Automated financial statement preparation per Ind AS standards.', obligationCode: 'OBL078', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Quarterly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'CFO' },
  { code: 'CTL156', name: 'Financial Statement Review', description: 'Multi-level review of financial statements before RBI submission.', obligationCode: 'OBL078', controlType: 'Detective', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Finance Controller' },

  // ── OBL079 Pillar 3 disclosure (AU066) ──────────────────────────────
  { code: 'CTL157', name: 'Pillar 3 Report Generator', description: 'Automated Pillar 3 disclosure report generation.', obligationCode: 'OBL079', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Quarterly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Disclosure Officer' },
  { code: 'CTL158', name: 'Disclosure Accuracy Review', description: 'Manual review of Pillar 3 disclosures for accuracy before publication.', obligationCode: 'OBL079', controlType: 'Detective', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Risk Reporting Head' },

  // ── OBL080 ICAAP assessment (AU067) ─────────────────────────────────
  { code: 'CTL159', name: 'ICAAP Framework', description: 'Annual ICAAP assessment with capital adequacy stress testing.', obligationCode: 'OBL080', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Annual', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'CRO' },
  { code: 'CTL160', name: 'Capital Adequacy Monitoring', description: 'Monthly monitoring of capital adequacy ratios against regulatory minimums.', obligationCode: 'OBL080', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Monthly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Capital Management' },

  // ── OBL081 Stress testing (AU067) ───────────────────────────────────
  { code: 'CTL161', name: 'Stress Test Scenario Engine', description: 'Automated stress test computation across credit, market, and liquidity scenarios.', obligationCode: 'OBL081', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Quarterly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Stress Testing Lead' },
  { code: 'CTL162', name: 'Stress Test Results Review', description: 'Board risk committee review of stress test results and action plans.', obligationCode: 'OBL081', controlType: 'Detective', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'CRO' },

  // ── OBL082 Cyber security framework (AU068) ────────────────────────
  { code: 'CTL163', name: 'SOC Operations', description: '24x7 Security Operations Centre with SIEM-based threat monitoring.', obligationCode: 'OBL082', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Real-time', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'CISO' },
  { code: 'CTL164', name: 'VAPT Schedule', description: 'Quarterly vulnerability assessment and penetration testing of critical systems.', obligationCode: 'OBL082', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Quarterly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Security Testing Lead' },

  // ── OBL083 Cyber incident reporting (AU068) ────────────────────────
  { code: 'CTL165', name: 'Incident Response Playbook', description: 'Documented incident response procedures with 6-hour reporting SLA.', obligationCode: 'OBL083', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Per Incident', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Incident Response Lead' },
  { code: 'CTL166', name: 'Cyber Incident Reporting System', description: 'Automated cyber incident classification and reporting to RBI-CERT.', obligationCode: 'OBL083', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Per Incident', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'CISO' },

  // ── OBL084 Operational risk events (AU069) ──────────────────────────
  { code: 'CTL167', name: 'Operational Risk Event Database', description: 'Centralized operational risk event capture and reporting system.', obligationCode: 'OBL084', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Per Event', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Operations Head' },
  { code: 'CTL168', name: 'Material Event Escalation', description: 'Automated escalation of material operational risk events to board within 24 hours.', obligationCode: 'OBL084', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Per Event', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Risk Manager' },

  // ── OBL085 Fraud reporting (AU070) ──────────────────────────────────
  { code: 'CTL169', name: 'Fraud Detection Engine', description: 'ML-based real-time fraud detection across all transaction channels.', obligationCode: 'OBL085', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Real-time', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Fraud Risk Head' },
  { code: 'CTL170', name: 'Fraud Reporting Workflow', description: 'Automated fraud reporting to RBI within 7 days with investigation tracking.', obligationCode: 'OBL085', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Per Incident', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Fraud Investigation Lead' },

  // ── OBL086 Fraud vulnerability assessment (AU070) ───────────────────
  { code: 'CTL171', name: 'Fraud Risk Assessment', description: 'Quarterly fraud vulnerability assessment across all business lines.', obligationCode: 'OBL086', controlType: 'Detective', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Fraud Analytics Lead' },
  { code: 'CTL172', name: 'Fraud Risk Register Update', description: 'Quarterly update of fraud risk register with emerging fraud typologies.', obligationCode: 'OBL086', controlType: 'Detective', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Fraud Risk Manager' },

  // ── OBL087 CVC vigilance report (AU071) ─────────────────────────────
  { code: 'CTL173', name: 'Vigilance Report Generator', description: 'Monthly vigilance report generation for CVC submission.', obligationCode: 'OBL087', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Monthly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'CVO' },
  { code: 'CTL174', name: 'Preventive Vigilance Inspection', description: 'Scheduled preventive vigilance inspections across branches.', obligationCode: 'OBL087', controlType: 'Detective', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Vigilance Inspector' },

  // ── OBL088 SEBI LODR disclosure (AU072) ─────────────────────────────
  { code: 'CTL175', name: 'Material Event Disclosure System', description: 'Automated material event identification and stock exchange disclosure.', obligationCode: 'OBL088', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Per Event', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Company Secretary' },
  { code: 'CTL176', name: 'LODR Compliance Checklist', description: 'Quarterly LODR compliance checklist with board sign-off.', obligationCode: 'OBL088', controlType: 'Detective', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Compliance Officer' },

  // ── OBL089 Board composition (AU072) ────────────────────────────────
  { code: 'CTL177', name: 'Board Composition Tracker', description: 'System-tracked board composition against RBI fit and proper criteria.', obligationCode: 'OBL089', controlType: 'Preventive', controlNature: 'IT-based manual', frequency: 'Annual', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Board Secretariat' },
  { code: 'CTL178', name: 'Director Due Diligence', description: 'Comprehensive due diligence for director appointments per RBI norms.', obligationCode: 'OBL089', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Appointment', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Company Secretary' },

  // ── OBL090 Branch premises (AU073) ──────────────────────────────────
  { code: 'CTL179', name: 'Branch Accessibility Audit', description: 'Annual audit of branch premises for accessibility compliance.', obligationCode: 'OBL090', controlType: 'Detective', controlNature: 'Manual', frequency: 'Annual', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Premises Head' },
  { code: 'CTL180', name: 'Security Standards Check', description: 'Quarterly security standards verification for all branch premises.', obligationCode: 'OBL090', controlType: 'Detective', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: false, ownerRole: 'Security Officer' },

  // ── OBL091 Vendor due diligence (AU074) ─────────────────────────────
  { code: 'CTL181', name: 'Vendor Due Diligence Framework', description: 'Standardized vendor due diligence process with risk scoring.', obligationCode: 'OBL091', controlType: 'Preventive', controlNature: 'IT-based manual', frequency: 'Per Vendor', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Procurement Head' },
  { code: 'CTL182', name: 'Approved Vendor List Review', description: 'Annual review and update of approved vendor list.', obligationCode: 'OBL091', controlType: 'Detective', controlNature: 'Manual', frequency: 'Annual', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Vendor Manager' },

  // ── OBL092 Data governance framework (AU075) ────────────────────────
  { code: 'CTL183', name: 'Data Quality Monitoring', description: 'Automated data quality metrics monitoring across regulatory reporting domains.', obligationCode: 'OBL092', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'CDO' },
  { code: 'CTL184', name: 'Data Lineage Documentation', description: 'Maintained data lineage for all regulatory reporting data flows.', obligationCode: 'OBL092', controlType: 'Preventive', controlNature: 'IT-based manual', frequency: 'Quarterly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Data Governance Lead' },

  // ── OBL093 DPDP Act compliance (AU075) ──────────────────────────────
  { code: 'CTL185', name: 'Consent Management Platform', description: 'Digital consent management for customer data processing per DPDP Act.', obligationCode: 'OBL093', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Customer', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Data Privacy Officer' },
  { code: 'CTL186', name: 'Data Processing Audit', description: 'Quarterly audit of data processing activities against consent records.', obligationCode: 'OBL093', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Quarterly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Privacy Compliance Lead' },

  // ── OBL094 Statutory returns (AU076) ────────────────────────────────
  { code: 'CTL187', name: 'Regulatory Return Scheduler', description: 'Automated scheduling and tracking of all statutory returns with deadline alerts.', obligationCode: 'OBL094', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'As Prescribed', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Regulatory Affairs Head' },
  { code: 'CTL188', name: 'Return Data Validation', description: 'Multi-level data validation before regulatory return submission.', obligationCode: 'OBL094', controlType: 'Preventive', controlNature: 'IT-based manual', frequency: 'Per Return', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Reporting Analyst' },
  { code: 'CTL189', name: 'Return Submission Tracker', description: 'Dashboard tracking submission status of all regulatory returns.', obligationCode: 'OBL094', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Regulatory Reporting Lead' },

  // ── OBL095 Credit documentation (AU077) ─────────────────────────────
  { code: 'CTL190', name: 'Credit Documentation Checklist', description: 'System-enforced credit documentation checklist with completeness tracking.', obligationCode: 'OBL095', controlType: 'Preventive', controlNature: 'IT-based manual', frequency: 'Per Facility', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Credit Admin Head' },
  { code: 'CTL191', name: 'Covenant Monitoring System', description: 'Automated covenant compliance monitoring with breach alerts.', obligationCode: 'OBL095', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Quarterly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Covenant Officer' },

  // ── OBL096 Treasury independent valuation (AU078) ───────────────────
  { code: 'CTL192', name: 'Independent Valuation Engine', description: 'Middle office independent valuation of all treasury positions.', obligationCode: 'OBL096', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Middle Office Head' },
  { code: 'CTL193', name: 'P&L Variance Analysis', description: 'Daily P&L variance analysis between front office and middle office.', obligationCode: 'OBL096', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Valuation Analyst' },

  // ── OBL097 STR filing (AU079) ───────────────────────────────────────
  { code: 'CTL194', name: 'Transaction Monitoring System', description: 'Rule-based and ML-driven transaction monitoring for suspicious activity detection.', obligationCode: 'OBL097', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Real-time', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'MLRO' },
  { code: 'CTL195', name: 'STR Filing Workflow', description: 'System-enforced STR filing workflow with 7-day SLA tracking.', obligationCode: 'OBL097', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Per Alert', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'AML Analyst' },

  // ── OBL098 Sanctions screening (AU079) ──────────────────────────────
  { code: 'CTL196', name: 'Sanctions Screening Engine', description: 'Real-time sanctions screening against OFAC, UN, and India sanctions lists.', obligationCode: 'OBL098', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Sanctions Officer' },
  { code: 'CTL197', name: 'Sanctions List Update', description: 'Automated daily update of sanctions lists from all relevant authorities.', obligationCode: 'OBL098', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'AML Technology Lead' },

  // ── OBL099 Customer complaint resolution (AU080) ────────────────────
  { code: 'CTL198', name: 'Complaint Resolution System', description: 'Centralized complaint management with 30-day SLA tracking and auto-escalation.', obligationCode: 'OBL099', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Per Complaint', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Grievance Head' },
  { code: 'CTL199', name: 'Ombudsman Escalation Workflow', description: 'Automated escalation of unresolved complaints to RBI Ombudsman.', obligationCode: 'OBL099', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Per Complaint', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Ombudsman Liaison' },

  // ── OBL100 ICOFR testing (AU081) ────────────────────────────────────
  { code: 'CTL200', name: 'ICOFR Testing Framework', description: 'Annual testing of all key ICOFR controls with deficiency classification.', obligationCode: 'OBL100', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Annual', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'ICOFR Lead' },
  { code: 'CTL201', name: 'ICOFR Deficiency Reporting', description: 'Automated reporting of ICOFR deficiencies to Audit Committee within 15 days.', obligationCode: 'OBL100', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Per Finding', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'ICOFR Manager' },

  // ── OBL101 BCP/DR drills (AU082) ────────────────────────────────────
  { code: 'CTL202', name: 'BCP Drill Execution', description: 'Semi-annual BCP/DR drill execution with RTO validation.', obligationCode: 'OBL101', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Semi-Annual', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'BCM Head' },
  { code: 'CTL203', name: 'Critical System RTO Monitoring', description: 'Continuous monitoring of critical system recovery capabilities.', obligationCode: 'OBL101', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Quarterly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'DR Manager' },

  // ── OBL102 Outsourcing compliance (AU083) ───────────────────────────
  { code: 'CTL204', name: 'Outsourcing Policy Review', description: 'Annual review of outsourcing policy against RBI guidelines.', obligationCode: 'OBL102', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Annual', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Outsourcing Head' },
  { code: 'CTL205', name: 'Outsourced Activity Risk Assessment', description: 'Annual risk assessment of all outsourced activities.', obligationCode: 'OBL102', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Annual', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Vendor Risk Manager' },

  // ── OBL103 Compliance training (AU084) ──────────────────────────────
  { code: 'CTL206', name: 'Training Completion Tracker', description: 'LMS-based tracking of mandatory compliance training completion.', obligationCode: 'OBL103', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Ongoing', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Training Head' },
  { code: 'CTL207', name: 'Training Effectiveness Assessment', description: 'Post-training assessment to verify knowledge retention.', obligationCode: 'OBL103', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Per Program', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'L&D Manager' },

  // ── OBL104 Business plan submission (AU085) ─────────────────────────
  { code: 'CTL208', name: 'Business Plan Review Process', description: 'Multi-level review of annual business plan before RBI submission.', obligationCode: 'OBL104', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Annual', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Strategy Head' },

  // ── OBL105 Investor information (AU086) ─────────────────────────────
  { code: 'CTL209', name: 'Investor Website Update', description: 'Quarterly update of investor information on bank website per SEBI LODR.', obligationCode: 'OBL105', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Quarterly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'IR Head' },

  // ── OBL106 Public communications (AU087) ────────────────────────────
  { code: 'CTL210', name: 'Communication Compliance Review', description: 'Pre-publication compliance review of all public communications.', obligationCode: 'OBL106', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Communication', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Communications Head' },

  // ── OBL107 Digital initiative assessment (AU088) ────────────────────
  { code: 'CTL211', name: 'Regulatory Impact Assessment', description: 'Mandatory regulatory impact assessment for new digital initiatives.', obligationCode: 'OBL107', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Initiative', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Digital Transformation Head' },
  { code: 'CTL212', name: 'Digital Initiative Compliance Sign-off', description: 'Compliance team sign-off before digital initiative deployment.', obligationCode: 'OBL107', controlType: 'Preventive', controlNature: 'IT-based manual', frequency: 'Per Initiative', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Compliance Officer' },

  // ── OBL108 PSL target (AU089) ───────────────────────────────────────
  { code: 'CTL213', name: 'PSL Target Monitoring Dashboard', description: 'Real-time PSL achievement tracking against 40% ANBC target.', obligationCode: 'OBL108', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'PSL Head' },
  { code: 'CTL214', name: 'PSL Return Preparation', description: 'Quarterly PSL return preparation with data validation.', obligationCode: 'OBL108', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Quarterly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'PSL Compliance Officer' },
  { code: 'CTL215', name: 'PSLC Trading Strategy', description: 'PSLC trading strategy execution for shortfall management.', obligationCode: 'OBL108', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'PSL Strategy Lead' },

  // ── Additional controls for OBL109-OBL124 ───────────────────────────

  // OBL109 Fair practice code lending (AU001)
  { code: 'CTL216', name: 'Loan Terms Disclosure System', description: 'Automated disclosure of loan terms, reset dates, and prepayment charges.', obligationCode: 'OBL109', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Loan', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Retail Lending Head' },
  { code: 'CTL217', name: 'FPC Compliance Audit', description: 'Quarterly audit of fair practice code compliance in retail lending.', obligationCode: 'OBL109', controlType: 'Detective', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Compliance Officer' },

  // OBL110 Periodic KYC updation (AU002)
  { code: 'CTL218', name: 'KYC Updation Tracker', description: 'Automated tracking of KYC updation due dates by risk category.', obligationCode: 'OBL110', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'KYC Compliance Officer' },
  { code: 'CTL219', name: 'KYC Updation Reminder System', description: 'Automated customer reminders for pending KYC updation.', obligationCode: 'OBL110', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'As Prescribed', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Branch Operations' },

  // OBL111 PCI-DSS compliance (AU003)
  { code: 'CTL220', name: 'PCI-DSS Assessment', description: 'Annual PCI-DSS compliance assessment by QSA.', obligationCode: 'OBL111', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Annual', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Card Security Lead' },
  { code: 'CTL221', name: 'Card Data Encryption', description: 'End-to-end encryption of card data in storage and transit.', obligationCode: 'OBL111', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Ongoing', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'IT Security' },

  // OBL112 FLDG compliance (AU004)
  { code: 'CTL222', name: 'FLDG Agreement Review', description: 'Legal and compliance review of FLDG arrangements with fintech partners.', obligationCode: 'OBL112', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Partnership', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Partnership Compliance Lead' },
  { code: 'CTL223', name: 'FLDG Limit Monitoring', description: 'Monitoring of FLDG exposure against RBI prescribed limits.', obligationCode: 'OBL112', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Monthly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Risk Manager' },

  // OBL113 Bank guarantee issuance (AU028)
  { code: 'CTL224', name: 'BG Approval Matrix', description: 'System-enforced approval matrix for bank guarantee issuance.', obligationCode: 'OBL113', controlType: 'Preventive', controlNature: 'IT-based manual', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'BG Operations Head' },
  { code: 'CTL225', name: 'BG Collateral Verification', description: 'Collateral adequacy verification before BG issuance.', obligationCode: 'OBL113', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Transaction', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Credit Officer' },

  // OBL114 Trading risk appetite (AU046)
  { code: 'CTL226', name: 'Risk Appetite Limit System', description: 'Real-time monitoring of trading positions against board-approved risk appetite.', obligationCode: 'OBL114', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Real-time', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Trading Risk Manager' },
  { code: 'CTL227', name: 'Limit Breach Investigation', description: 'Mandatory investigation and reporting of all risk appetite limit breaches.', obligationCode: 'OBL114', controlType: 'Detective', controlNature: 'Manual', frequency: 'Per Breach', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Risk Committee' },

  // OBL115 CRR maintenance (AU050)
  { code: 'CTL228', name: 'CRR Monitoring System', description: 'Real-time CRR monitoring against NDTL with automated alerts.', obligationCode: 'OBL115', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Reserve Management Officer' },
  { code: 'CTL229', name: 'CRR Daily Reporting', description: 'Automated daily CRR reporting to RBI.', obligationCode: 'OBL115', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Regulatory Reporting' },

  // OBL116 Whistle-blower mechanism (AU062)
  { code: 'CTL230', name: 'Whistle-Blower Portal', description: 'Anonymous whistle-blower reporting portal with case tracking.', obligationCode: 'OBL116', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Ongoing', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Compliance Head' },
  { code: 'CTL231', name: 'Whistle-Blower Protection Review', description: 'Quarterly review of whistle-blower protection measures.', obligationCode: 'OBL116', controlType: 'Detective', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Ethics Officer' },

  // OBL117 Risk appetite framework (AU067)
  { code: 'CTL232', name: 'Risk Appetite Statement Review', description: 'Annual board review and approval of risk appetite statement.', obligationCode: 'OBL117', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Annual', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Risk Appetite Manager' },
  { code: 'CTL233', name: 'Risk Appetite Cascade Monitoring', description: 'Quarterly monitoring of risk appetite cascade to business units.', obligationCode: 'OBL117', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Quarterly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Enterprise Risk Lead' },

  // OBL118 CERT-In reporting (AU068)
  { code: 'CTL234', name: 'CERT-In Reporting System', description: 'Automated cyber incident reporting to CERT-In within 6-hour SLA.', obligationCode: 'OBL118', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Per Incident', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'SOC Lead' },
  { code: 'CTL235', name: 'Log Retention Policy', description: 'Automated log retention for 180 days per CERT-In directions.', obligationCode: 'OBL118', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Ongoing', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'IT Security' },

  // OBL119 NACH operations (AU006)
  { code: 'CTL236', name: 'NACH Mandate Processing', description: 'Automated NACH mandate processing within prescribed TAT.', obligationCode: 'OBL119', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Mandate', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'NACH Operations Lead' },
  { code: 'CTL237', name: 'NACH Dispute Resolution', description: 'System-tracked NACH dispute resolution with SLA monitoring.', obligationCode: 'OBL119', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Per Dispute', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Dispute Resolution Lead' },

  // OBL120 MSME restructuring (AU033)
  { code: 'CTL238', name: 'MSME Restructuring Eligibility Check', description: 'Automated eligibility check for MSME restructuring framework.', obligationCode: 'OBL120', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Case', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'MSME Recovery Head' },
  { code: 'CTL239', name: 'Restructuring Timeline Tracker', description: 'System-tracked 90-day restructuring timeline with milestone monitoring.', obligationCode: 'OBL120', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Per Case', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Recovery Manager' },

  // OBL121 TDS compliance (AU066)
  { code: 'CTL240', name: 'TDS Computation Engine', description: 'Automated TDS computation and deduction for applicable transactions.', obligationCode: 'OBL121', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Tax Manager' },
  { code: 'CTL241', name: 'TDS Remittance Tracker', description: 'Monthly tracking of TDS remittance against deduction records.', obligationCode: 'OBL121', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Monthly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Tax Compliance Officer' },

  // OBL122 EWS for fraud (AU070)
  { code: 'CTL242', name: 'EWS Trigger Engine', description: 'Automated early warning signal triggers for fraud detection.', obligationCode: 'OBL122', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Real-time', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'EWS Lead' },
  { code: 'CTL243', name: 'EWS Alert Investigation', description: 'Mandatory investigation of all EWS alerts within 48 hours.', obligationCode: 'OBL122', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Per Alert', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Fraud Investigator' },

  // OBL123 CTR filing (AU079)
  { code: 'CTL244', name: 'CTR Generation System', description: 'Automated CTR generation for cash transactions ≥₹10 Lakh.', obligationCode: 'OBL123', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'CTR Officer' },
  { code: 'CTL245', name: 'CTR Filing Compliance Check', description: 'Monthly reconciliation of CTR filings against cash transaction records.', obligationCode: 'OBL123', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Monthly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'AML Compliance' },

  // OBL124 RBI inspection compliance (AU076)
  { code: 'CTL246', name: 'Inspection Observation Tracker', description: 'System-tracked RBI inspection observations with remediation timelines.', obligationCode: 'OBL124', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Per Inspection', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Inspection Liaison' },
  { code: 'CTL247', name: 'Compliance Report Preparation', description: 'Structured compliance report preparation for RBI inspection observations.', obligationCode: 'OBL124', controlType: 'Detective', controlNature: 'Manual', frequency: 'Per Inspection', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Regulatory Affairs Head' },

  // ── Extra controls to reach 300+ ────────────────────────────────────

  // Additional controls for high-risk AUs

  // AU001 - extra detective control
  { code: 'CTL248', name: 'Loan Disbursement Reconciliation', description: 'Daily reconciliation of loan disbursements against sanction records.', obligationCode: 'OBL001', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Disbursement Manager' },

  // AU002 - extra KYC control
  { code: 'CTL249', name: 'CKYC Upload Monitoring', description: 'Monitoring of CKYC record uploads to central KYC registry.', obligationCode: 'OBL003', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'KYC Operations' },

  // AU006 - extra reconciliation control
  { code: 'CTL250', name: 'Inter-Branch Reconciliation', description: 'Daily inter-branch transaction reconciliation with exception reporting.', obligationCode: 'OBL010', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Reconciliation Lead' },

  // AU028 - extra trade finance control
  { code: 'CTL251', name: 'Trade Document Verification', description: 'Document verification against UCP 600 standards for all trade transactions.', obligationCode: 'OBL036', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Per Transaction', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Trade Documentation Officer' },

  // AU046 - extra market risk control
  { code: 'CTL252', name: 'Stress Testing for Trading Book', description: 'Weekly stress testing of trading book positions under extreme scenarios.', obligationCode: 'OBL055', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Weekly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Market Risk Analyst' },

  // AU050 - extra liquidity control
  { code: 'CTL253', name: 'Intraday Liquidity Monitoring', description: 'Real-time intraday liquidity position monitoring across all payment systems.', obligationCode: 'OBL059', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Real-time', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Liquidity Manager' },

  // AU068 - extra cyber security control
  { code: 'CTL254', name: 'Phishing Simulation', description: 'Monthly phishing simulation exercises for employee awareness.', obligationCode: 'OBL082', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Monthly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Security Awareness Lead' },

  // AU070 - extra fraud control
  { code: 'CTL255', name: 'Fraud Pattern Analysis', description: 'Weekly analysis of fraud patterns and emerging typologies.', obligationCode: 'OBL085', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Weekly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Fraud Analytics Lead' },

  // AU079 - extra AML control
  { code: 'CTL256', name: 'PEP Screening', description: 'Automated screening of customers against PEP databases.', obligationCode: 'OBL097', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Customer', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'AML Screening Lead' },

  // AU067 - extra risk management control
  { code: 'CTL257', name: 'Risk Dashboard Reporting', description: 'Daily enterprise risk dashboard with key risk indicators.', obligationCode: 'OBL080', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Risk Reporting Lead' },

  // AU062 - extra compliance control
  { code: 'CTL258', name: 'Regulatory Change Management', description: 'Automated tracking of regulatory changes with impact assessment workflow.', obligationCode: 'OBL074', controlType: 'Preventive', controlNature: 'IT-based manual', frequency: 'Per Change', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Regulatory Change Lead' },

  // AU076 - extra regulatory reporting control
  { code: 'CTL259', name: 'Return Accuracy Reconciliation', description: 'Pre-submission reconciliation of regulatory return data against source systems.', obligationCode: 'OBL094', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Return', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Data Quality Lead' },

  // AU066 - extra financial reporting control
  { code: 'CTL260', name: 'ECL Model Computation', description: 'Automated Expected Credit Loss computation per Ind AS 109.', obligationCode: 'OBL078', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Quarterly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'ECL Model Lead' },

  // AU075 - extra data governance control
  { code: 'CTL261', name: 'Data Breach Response Plan', description: 'Documented data breach response plan with notification procedures.', obligationCode: 'OBL093', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Per Incident', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Data Protection Officer' },

  // AU063 - extra audit control
  { code: 'CTL262', name: 'Concurrent Audit Monitoring', description: 'Real-time monitoring of concurrent audit findings across branches.', obligationCode: 'OBL075', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Concurrent Audit Lead' },

  // AU081 - extra ICOFR control
  { code: 'CTL263', name: 'ICOFR Control Self-Assessment', description: 'Annual control self-assessment by process owners for ICOFR controls.', obligationCode: 'OBL100', controlType: 'Detective', controlNature: 'Manual', frequency: 'Annual', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Process Owner' },

  // AU082 - extra BCP control
  { code: 'CTL264', name: 'Crisis Communication Plan', description: 'Documented crisis communication plan with stakeholder notification procedures.', obligationCode: 'OBL101', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Annual', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Crisis Manager' },

  // AU004 - extra digital lending control
  { code: 'CTL265', name: 'Digital Lending Grievance Mechanism', description: 'Dedicated grievance mechanism for digital lending customers per RBI guidelines.', obligationCode: 'OBL007', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Per Complaint', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Digital Customer Service' },

  // AU016 - extra payments control
  { code: 'CTL266', name: 'Payment Fraud Rule Engine', description: 'Real-time rule-based fraud detection for payment transactions.', obligationCode: 'OBL022', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Real-time', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Payments Fraud Lead' },

  // AU030 - extra credit risk control
  { code: 'CTL267', name: 'SMA Classification Monitor', description: 'Automated SMA-0/1/2 classification monitoring for early stress detection.', obligationCode: 'OBL039', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Credit Monitoring Lead' },

  // AU033 - extra SME control
  { code: 'CTL268', name: 'MSME Credit Guarantee Tracking', description: 'Tracking of CGTMSE guarantee coverage for eligible MSME loans.', obligationCode: 'OBL042', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Per Loan', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'MSME Operations' },

  // AU053 - extra investment control
  { code: 'CTL269', name: 'HTM Portfolio Review', description: 'Quarterly review of HTM portfolio for impairment and reclassification needs.', obligationCode: 'OBL063', controlType: 'Detective', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Investment Review Committee' },

  // AU061 - extra IT control
  { code: 'CTL270', name: 'Change Management Process', description: 'System-enforced change management process for all production changes.', obligationCode: 'OBL072', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Change', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Change Manager' },

  // AU064 - extra HR control
  { code: 'CTL271', name: 'Employee Background Verification', description: 'Mandatory background verification for all new hires.', obligationCode: 'OBL076', controlType: 'Preventive', controlNature: 'IT-based manual', frequency: 'Per Hire', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'HR Operations' },

  // AU072 - extra governance control
  { code: 'CTL272', name: 'Related Party Transaction Monitor', description: 'Automated monitoring and disclosure of related party transactions.', obligationCode: 'OBL089', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Company Secretary' },

  // AU083 - extra outsourcing control
  { code: 'CTL273', name: 'SLA Performance Monitoring', description: 'Automated SLA performance monitoring for all outsourced activities.', obligationCode: 'OBL102', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Monthly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Vendor Performance Lead' },

  // AU084 - extra training control
  { code: 'CTL274', name: 'Certification Tracking System', description: 'System-tracked professional certification requirements and renewals.', obligationCode: 'OBL103', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Ongoing', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Certification Manager' },

  // AU080 - extra grievance control
  { code: 'CTL275', name: 'Complaint Root Cause Analysis', description: 'Monthly root cause analysis of top complaint categories.', obligationCode: 'OBL099', controlType: 'Detective', controlNature: 'Manual', frequency: 'Monthly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Quality Analyst' },

  // AU014 - extra credit risk control
  { code: 'CTL276', name: 'Portfolio Concentration Monitor', description: 'Automated monitoring of retail portfolio concentration by product, geography, and segment.', obligationCode: 'OBL020', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Monthly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Portfolio Risk Manager' },

  // AU026 - extra large corporate control
  { code: 'CTL277', name: 'Group Exposure Consolidation', description: 'Automated consolidation of group-level exposures across all entities.', obligationCode: 'OBL034', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Group Exposure Manager' },

  // AU037 - extra recovery control
  { code: 'CTL278', name: 'NCLT Case Tracker', description: 'System-tracked NCLT case milestones and hearing dates.', obligationCode: 'OBL046', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Per Case', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Legal Recovery Lead' },

  // AU048 - extra treasury control
  { code: 'CTL279', name: 'Deal Confirmation Matching', description: 'Automated deal confirmation matching between front and back office.', obligationCode: 'OBL057', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Per Deal', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Treasury Operations' },

  // AU058 - extra market risk control
  { code: 'CTL280', name: 'Sensitivity Analysis Engine', description: 'Automated sensitivity analysis (DV01, CS01, Vega) for all trading positions.', obligationCode: 'OBL069', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Quantitative Analyst' },

  // AU071 - extra vigilance control
  { code: 'CTL281', name: 'Staff Accountability Review', description: 'Review of staff accountability in vigilance cases per CVC guidelines.', obligationCode: 'OBL087', controlType: 'Detective', controlNature: 'Manual', frequency: 'Per Case', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Vigilance Officer' },

  // AU074 - extra procurement control
  { code: 'CTL282', name: 'Contract Compliance Monitoring', description: 'Automated monitoring of vendor contract compliance and renewal dates.', obligationCode: 'OBL091', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Monthly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Contract Manager' },

  // AU086 - extra investor relations control
  { code: 'CTL283', name: 'Earnings Call Compliance Review', description: 'Pre-call compliance review of earnings presentation materials.', obligationCode: 'OBL105', controlType: 'Preventive', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'IR Compliance' },

  // AU088 - extra digital transformation control
  { code: 'CTL284', name: 'Innovation Sandbox Governance', description: 'Governance framework for innovation sandbox with regulatory boundary monitoring.', obligationCode: 'OBL107', controlType: 'Preventive', controlNature: 'IT-based manual', frequency: 'Per Initiative', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Innovation Lead' },

  // AU089 - extra PSL control
  { code: 'CTL285', name: 'PSL Classification Audit', description: 'Quarterly audit of PSL classification accuracy across all lending categories.', obligationCode: 'OBL108', controlType: 'Detective', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'PSL Audit Lead' },

  // AU005 - extra deposit control
  { code: 'CTL286', name: 'Unclaimed Deposit Monitoring', description: 'Automated monitoring and reporting of unclaimed deposits per RBI guidelines.', obligationCode: 'OBL009', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Monthly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Deposits Compliance' },

  // AU007 - extra home loan control
  { code: 'CTL287', name: 'Home Loan Interest Rate Reset', description: 'Automated interest rate reset communication to borrowers per RBI norms.', obligationCode: 'OBL012', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Reset', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Home Loan Operations' },

  // AU011 - extra wealth management control
  { code: 'CTL288', name: 'Wealth Client Risk Review', description: 'Annual risk profile review for all wealth management clients.', obligationCode: 'OBL017', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Annual', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Wealth Risk Manager' },

  // AU012 - extra NRI control
  { code: 'CTL289', name: 'NRI Repatriation Limit Check', description: 'Automated repatriation limit check for NRO account transfers.', obligationCode: 'OBL018', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'NRI Operations' },

  // AU022 - extra agri control
  { code: 'CTL290', name: 'Crop Insurance Linkage', description: 'Mandatory crop insurance linkage verification for agriculture loans.', obligationCode: 'OBL029', controlType: 'Preventive', controlNature: 'IT-based manual', frequency: 'Per Loan', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Agri Loan Officer' },

  // AU031 - extra transaction banking control
  { code: 'CTL291', name: 'Payment Sanctions Screening', description: 'Real-time sanctions screening for all corporate payment transactions.', obligationCode: 'OBL040', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Compliance Screening' },

  // AU038 - extra government banking control
  { code: 'CTL292', name: 'Life Certificate Verification', description: 'Digital life certificate verification for pension accounts.', obligationCode: 'OBL047', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Annual', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Pension Operations' },

  // AU039 - extra correspondent banking control
  { code: 'CTL293', name: 'CB Transaction Monitoring', description: 'Enhanced transaction monitoring for correspondent banking channels.', obligationCode: 'OBL048', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Real-time', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'AML Monitoring' },

  // AU044 - extra infra finance control
  { code: 'CTL294', name: 'Project Milestone Monitoring', description: 'System-tracked project milestone monitoring with disbursement linkage.', obligationCode: 'OBL053', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Monthly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Project Finance Lead' },

  // AU049 - extra forex control
  { code: 'CTL295', name: 'Forex Position Limit Monitor', description: 'Real-time monitoring of forex open position against prescribed limits.', obligationCode: 'OBL058', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Real-time', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Forex Risk Manager' },

  // AU051 - extra derivatives control
  { code: 'CTL296', name: 'Derivatives Valuation Adjustment', description: 'Automated CVA/DVA/FVA computation for OTC derivatives.', obligationCode: 'OBL061', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Quantitative Analyst' },

  // AU055 - extra treasury ops control
  { code: 'CTL297', name: 'Nostro Reconciliation', description: 'Daily nostro account reconciliation for treasury settlements.', obligationCode: 'OBL066', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Reconciliation Lead' },

  // AU059 - extra collateral control
  { code: 'CTL298', name: 'Collateral Eligibility Check', description: 'Automated eligibility check for collateral against regulatory haircut schedules.', obligationCode: 'OBL070', controlType: 'Preventive', controlNature: 'IT-driven', frequency: 'Per Transaction', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Collateral Analyst' },

  // AU065 - extra legal control
  { code: 'CTL299', name: 'Litigation Provision Review', description: 'Quarterly review of litigation provisions and contingent liabilities.', obligationCode: 'OBL077', controlType: 'Detective', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Legal Finance Liaison' },

  // AU069 - extra operations control
  { code: 'CTL300', name: 'Clearing and Settlement Reconciliation', description: 'Daily clearing and settlement reconciliation across all payment systems.', obligationCode: 'OBL084', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Daily', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Settlement Manager' },

  // AU013 - extra collections control
  { code: 'CTL301', name: 'Recovery Agent Performance Review', description: 'Monthly performance review of recovery agents with compliance scoring.', obligationCode: 'OBL019', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Monthly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Agency Management Lead' },

  // AU015 - extra bancassurance control
  { code: 'CTL302', name: 'Insurance Claim Settlement Tracking', description: 'System-tracked insurance claim settlement status for bancassurance customers.', obligationCode: 'OBL021', controlType: 'Detective', controlNature: 'IT-based manual', frequency: 'Per Claim', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Claims Liaison' },

  // AU018 - extra microfinance control
  { code: 'CTL303', name: 'Microfinance Field Audit', description: 'Quarterly field audit of microfinance operations and borrower verification.', obligationCode: 'OBL025', controlType: 'Detective', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Field Audit Lead' },

  // AU020 - extra customer service control
  { code: 'CTL304', name: 'Mystery Shopping Program', description: 'Quarterly mystery shopping to assess customer service quality at branches.', obligationCode: 'OBL027', controlType: 'Detective', controlNature: 'Manual', frequency: 'Quarterly', monitoringMechanism: 'NA+Manual', isDocumented: true, ownerRole: 'Service Quality Lead' },

  // AU029 - extra structured finance control
  { code: 'CTL305', name: 'Waterfall Payment Monitoring', description: 'Automated monitoring of securitisation waterfall payment compliance.', obligationCode: 'OBL038', controlType: 'Detective', controlNature: 'IT-driven', frequency: 'Monthly', monitoringMechanism: 'MRC+IT', isDocumented: true, ownerRole: 'Securitisation Manager' },
];

export async function seedControls(
  prisma: PrismaClient,
  obligations: ComplianceObligation[],
): Promise<Control[]> {
  const oblMap = new Map(obligations.map((o) => [o.code, o]));
  const results: Control[] = [];

  for (const ctrl of CONTROLS) {
    const obligation = oblMap.get(ctrl.obligationCode);
    if (!obligation) {
      console.warn(`  ⚠ Skipping control ${ctrl.code}: obligation=${ctrl.obligationCode} not found`);
      continue;
    }

    const record = await prisma.control.upsert({
      where: { code: ctrl.code },
      update: {
        name: ctrl.name,
        description: ctrl.description,
        obligationId: obligation.id,
        controlType: ctrl.controlType,
        controlNature: ctrl.controlNature,
        frequency: ctrl.frequency,
        monitoringMechanism: ctrl.monitoringMechanism,
        isDocumented: ctrl.isDocumented,
        ownerRole: ctrl.ownerRole,
        isActive: true,
      },
      create: {
        code: ctrl.code,
        name: ctrl.name,
        description: ctrl.description,
        obligationId: obligation.id,
        controlType: ctrl.controlType,
        controlNature: ctrl.controlNature,
        frequency: ctrl.frequency,
        monitoringMechanism: ctrl.monitoringMechanism,
        isDocumented: ctrl.isDocumented,
        ownerRole: ctrl.ownerRole,
        isActive: true,
      },
    });
    results.push(record);
  }

  console.log(`  ✓ Seeded ${results.length} controls`);
  return results;
}
