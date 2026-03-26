/**
 * Seed data for 120+ compliance obligations mapped across 89 AUs.
 * ~70% RBI source, criticalities spread across Critical/High/Medium/Low.
 * Requirements: 2.2, 27.4
 */
import { PrismaClient, ComplianceObligation, Theme, AssessmentUnit } from '@prisma/client';

interface ObligationDef {
  code: string;
  regulationSource: string;
  regulationRef: string;
  regulationName: string;
  referenceParagraph: string;
  description: string;
  ownerWithinAU: string;
  frequency: string;
  themeCode: string;
  auCode: string;
  criticality: string;
}

const OBLIGATIONS: ObligationDef[] = [
  // ── AU001 Retail Assets Operations Group ─────────────────────────────
  { code: 'OBL001', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/45', regulationName: 'Master Direction on Lending', referenceParagraph: 'Para 4.2', description: 'Ensure retail loan origination follows prescribed credit appraisal norms and income verification standards.', ownerWithinAU: 'Credit Manager', frequency: 'Ongoing', themeCode: 'T03', auCode: 'AU001', criticality: 'Critical' },
  { code: 'OBL002', regulationSource: 'RBI', regulationRef: 'RBI/2021-22/112', regulationName: 'IRAC Norms', referenceParagraph: 'Para 2.1', description: 'Classify retail loan accounts as per IRAC norms within prescribed timelines.', ownerWithinAU: 'NPA Manager', frequency: 'Monthly', themeCode: 'T03', auCode: 'AU001', criticality: 'Critical' },

  // ── AU002 Branch Banking ─────────────────────────────────────────────
  { code: 'OBL003', regulationSource: 'RBI', regulationRef: 'RBI/2016-17/55', regulationName: 'KYC Master Direction', referenceParagraph: 'Para 3.1', description: 'Complete KYC verification for all new account openings within prescribed timelines.', ownerWithinAU: 'Branch Manager', frequency: 'Ongoing', themeCode: 'T01', auCode: 'AU002', criticality: 'Critical' },
  { code: 'OBL004', regulationSource: 'RBI', regulationRef: 'RBI/2022-23/78', regulationName: 'Cash Management Guidelines', referenceParagraph: 'Para 5.3', description: 'Maintain cash retention limits and report excess cash holdings to currency chest.', ownerWithinAU: 'Cash Officer', frequency: 'Daily', themeCode: 'T02', auCode: 'AU002', criticality: 'High' },

  // ── AU003 Cards Product ──────────────────────────────────────────────
  { code: 'OBL005', regulationSource: 'RBI', regulationRef: 'RBI/2022-23/15', regulationName: 'Master Direction on Credit/Debit Cards', referenceParagraph: 'Para 6.1', description: 'Ensure card issuance follows prescribed eligibility criteria and credit limit norms.', ownerWithinAU: 'Cards Head', frequency: 'Ongoing', themeCode: 'T05', auCode: 'AU003', criticality: 'High' },
  { code: 'OBL006', regulationSource: 'RBI', regulationRef: 'RBI/2022-23/15', regulationName: 'Master Direction on Credit/Debit Cards', referenceParagraph: 'Para 8.2', description: 'Implement transaction alerts and two-factor authentication for all card transactions.', ownerWithinAU: 'Cards Technology Lead', frequency: 'Ongoing', themeCode: 'T05', auCode: 'AU003', criticality: 'Critical' },

  // ── AU004 Digital Channels and Partnership ───────────────────────────
  { code: 'OBL007', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/56', regulationName: 'Digital Lending Guidelines', referenceParagraph: 'Para 3.1', description: 'Ensure all digital lending products comply with RBI digital lending guidelines including disclosure norms.', ownerWithinAU: 'Digital Head', frequency: 'Ongoing', themeCode: 'T11', auCode: 'AU004', criticality: 'Critical' },
  { code: 'OBL008', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/56', regulationName: 'Digital Lending Guidelines', referenceParagraph: 'Para 5.2', description: 'Maintain audit trail for all digital loan disbursements and ensure funds flow directly to borrower account.', ownerWithinAU: 'Partnership Manager', frequency: 'Ongoing', themeCode: 'T11', auCode: 'AU004', criticality: 'High' },

  // ── AU005 Retail Liabilities ─────────────────────────────────────────
  { code: 'OBL009', regulationSource: 'RBI', regulationRef: 'RBI/2020-21/34', regulationName: 'Deposit Insurance', referenceParagraph: 'Para 2.1', description: 'Ensure all eligible deposits are covered under DICGC insurance and premium is remitted timely.', ownerWithinAU: 'Deposits Head', frequency: 'Quarterly', themeCode: 'T02', auCode: 'AU005', criticality: 'High' },

  // ── AU006 Liabilities Operations Group (Demo: Daily Cash Reconciliation) ──
  { code: 'OBL010', regulationSource: 'RBI', regulationRef: 'RBI/2019-20/88', regulationName: 'Reconciliation Policy Guidelines', referenceParagraph: 'Para 4.1', description: 'Daily Cash Reconciliation — Perform end-of-day cash reconciliation across all branches and ATM channels with zero tolerance for unreconciled items beyond T+1.', ownerWithinAU: 'Operations Head', frequency: 'Daily', themeCode: 'T02', auCode: 'AU006', criticality: 'Critical' },
  { code: 'OBL011', regulationSource: 'RBI', regulationRef: 'RBI/2021-22/45', regulationName: 'Account Opening Norms', referenceParagraph: 'Para 3.2', description: 'Ensure account opening documentation is complete and verified within 7 working days.', ownerWithinAU: 'Account Services Manager', frequency: 'Ongoing', themeCode: 'T02', auCode: 'AU006', criticality: 'Medium' },

  // ── AU007 Home Loans ─────────────────────────────────────────────────
  { code: 'OBL012', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/12', regulationName: 'Housing Finance Norms', referenceParagraph: 'Para 6.1', description: 'Ensure LTV ratio compliance for all home loan disbursements as per RBI norms.', ownerWithinAU: 'Home Loan Manager', frequency: 'Ongoing', themeCode: 'T03', auCode: 'AU007', criticality: 'High' },
  { code: 'OBL013', regulationSource: 'NHB', regulationRef: 'NHB/2022/08', regulationName: 'NHB Refinance Guidelines', referenceParagraph: 'Para 2.3', description: 'Submit NHB refinance claims with complete documentation within prescribed timelines.', ownerWithinAU: 'Refinance Officer', frequency: 'Quarterly', themeCode: 'T03', auCode: 'AU007', criticality: 'Medium' },

  // ── AU008 Personal Loans ─────────────────────────────────────────────
  { code: 'OBL014', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/45', regulationName: 'Master Direction on Lending', referenceParagraph: 'Para 7.1', description: 'Ensure personal loan pricing transparency and disclosure of all charges upfront.', ownerWithinAU: 'Personal Loan Head', frequency: 'Ongoing', themeCode: 'T03', auCode: 'AU008', criticality: 'High' },

  // ── AU009 Vehicle Loans ──────────────────────────────────────────────
  { code: 'OBL015', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/45', regulationName: 'Master Direction on Lending', referenceParagraph: 'Para 8.2', description: 'Verify vehicle registration and hypothecation within 30 days of disbursement.', ownerWithinAU: 'Vehicle Loan Manager', frequency: 'Ongoing', themeCode: 'T03', auCode: 'AU009', criticality: 'Medium' },

  // ── AU010 Education Loans ────────────────────────────────────────────
  { code: 'OBL016', regulationSource: 'RBI', regulationRef: 'RBI/2022-23/90', regulationName: 'Education Loan Scheme', referenceParagraph: 'Para 3.1', description: 'Process education loan applications within 15 days and communicate sanction/rejection with reasons.', ownerWithinAU: 'Education Loan Officer', frequency: 'Ongoing', themeCode: 'T03', auCode: 'AU010', criticality: 'Medium' },

  // ── AU011 Wealth Management ──────────────────────────────────────────
  { code: 'OBL017', regulationSource: 'SEBI', regulationRef: 'SEBI/HO/IMD/2023', regulationName: 'Investment Advisory Regulations', referenceParagraph: 'Reg 15', description: 'Ensure suitability assessment for all wealth management product recommendations.', ownerWithinAU: 'Wealth Advisor', frequency: 'Per Transaction', themeCode: 'T04', auCode: 'AU011', criticality: 'High' },

  // ── AU012 NRI Banking ────────────────────────────────────────────────
  { code: 'OBL018', regulationSource: 'RBI', regulationRef: 'FEMA/2023/01', regulationName: 'FEMA Deposit Regulations', referenceParagraph: 'Reg 5', description: 'Ensure NRE/NRO account operations comply with FEMA regulations and repatriation limits.', ownerWithinAU: 'NRI Banking Head', frequency: 'Ongoing', themeCode: 'T06', auCode: 'AU012', criticality: 'Critical' },

  // ── AU013 Retail Collections ─────────────────────────────────────────
  { code: 'OBL019', regulationSource: 'RBI', regulationRef: 'RBI/2022-23/44', regulationName: 'Fair Practices Code for Recovery', referenceParagraph: 'Para 4.1', description: 'Ensure recovery agents follow RBI fair practices code and do not use coercive methods.', ownerWithinAU: 'Collections Head', frequency: 'Ongoing', themeCode: 'T08', auCode: 'AU013', criticality: 'High' },

  // ── AU014 Retail Credit Risk ─────────────────────────────────────────
  { code: 'OBL020', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/30', regulationName: 'Credit Risk Management Framework', referenceParagraph: 'Para 5.1', description: 'Validate credit scoring models annually and ensure model risk governance compliance.', ownerWithinAU: 'Model Risk Manager', frequency: 'Annual', themeCode: 'T10', auCode: 'AU014', criticality: 'High' },

  // ── AU015 Bancassurance ──────────────────────────────────────────────
  { code: 'OBL021', regulationSource: 'IRDAI', regulationRef: 'IRDAI/2022/CA', regulationName: 'Corporate Agency Regulations', referenceParagraph: 'Reg 8', description: 'Ensure bancassurance sales comply with IRDAI corporate agency regulations and mis-selling prevention.', ownerWithinAU: 'Bancassurance Head', frequency: 'Ongoing', themeCode: 'T07', auCode: 'AU015', criticality: 'Medium' },

  // ── AU016 Retail Payments ────────────────────────────────────────────
  { code: 'OBL022', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/PSS', regulationName: 'Payment Systems Regulations', referenceParagraph: 'Para 6.1', description: 'Ensure UPI transaction processing within prescribed SLA and maintain 99.5% uptime.', ownerWithinAU: 'Payments Head', frequency: 'Ongoing', themeCode: 'T05', auCode: 'AU016', criticality: 'Critical' },
  { code: 'OBL023', regulationSource: 'NPCI', regulationRef: 'NPCI/UPI/2023', regulationName: 'UPI Operating Guidelines', referenceParagraph: 'Clause 12', description: 'Report UPI transaction failures and maintain dispute resolution within TAT.', ownerWithinAU: 'UPI Operations Lead', frequency: 'Daily', themeCode: 'T05', auCode: 'AU016', criticality: 'High' },

  // ── AU017 Gold Loans ─────────────────────────────────────────────────
  { code: 'OBL024', regulationSource: 'RBI', regulationRef: 'RBI/2022-23/GL', regulationName: 'Gold Loan Guidelines', referenceParagraph: 'Para 3.1', description: 'Ensure gold valuation by certified appraiser and maintain LTV within 75%.', ownerWithinAU: 'Gold Loan Manager', frequency: 'Per Loan', themeCode: 'T03', auCode: 'AU017', criticality: 'High' },

  // ── AU018 Microfinance ───────────────────────────────────────────────
  { code: 'OBL025', regulationSource: 'RBI', regulationRef: 'RBI/2022-23/MF', regulationName: 'Microfinance Lending Norms', referenceParagraph: 'Para 4.2', description: 'Ensure household income assessment and total indebtedness check before microfinance disbursement.', ownerWithinAU: 'Microfinance Head', frequency: 'Per Loan', themeCode: 'T03', auCode: 'AU018', criticality: 'High' },

  // ── AU019 Retail Product Development ─────────────────────────────────
  { code: 'OBL026', regulationSource: 'RBI', regulationRef: 'RBI/2021-22/PD', regulationName: 'Product Approval Process', referenceParagraph: 'Para 2.1', description: 'Obtain regulatory approval for new retail products before launch and maintain product governance framework.', ownerWithinAU: 'Product Head', frequency: 'Per Product', themeCode: 'T19', auCode: 'AU019', criticality: 'Medium' },

  // ── AU020 Customer Service Centre ────────────────────────────────────
  { code: 'OBL027', regulationSource: 'RBI', regulationRef: 'RBI/2021-22/CS', regulationName: 'Customer Service Standards', referenceParagraph: 'Para 5.1', description: 'Resolve customer complaints within prescribed TAT and escalate unresolved cases to Banking Ombudsman.', ownerWithinAU: 'Service Quality Head', frequency: 'Ongoing', themeCode: 'T08', auCode: 'AU020', criticality: 'High' },

  // ── AU021 ATM and Self-Service ───────────────────────────────────────
  { code: 'OBL028', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/ATM', regulationName: 'ATM Operations Guidelines', referenceParagraph: 'Para 3.2', description: 'Ensure ATM cash availability above 95% and resolve failed transactions within 5 working days.', ownerWithinAU: 'ATM Operations Head', frequency: 'Daily', themeCode: 'T05', auCode: 'AU021', criticality: 'Medium' },

  // ── AU022 Rural and Agri Banking ─────────────────────────────────────
  { code: 'OBL029', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/PSL', regulationName: 'Priority Sector Lending Norms', referenceParagraph: 'Para 7.1', description: 'Achieve agriculture lending sub-target of 18% of ANBC as per PSL norms.', ownerWithinAU: 'Agri Banking Head', frequency: 'Quarterly', themeCode: 'T03', auCode: 'AU022', criticality: 'Critical' },

  // ── AU023 Third Party Products ───────────────────────────────────────
  { code: 'OBL030', regulationSource: 'SEBI', regulationRef: 'SEBI/MF/2023', regulationName: 'Mutual Fund Distribution Norms', referenceParagraph: 'Reg 12', description: 'Ensure suitability and risk profiling before mutual fund recommendations to customers.', ownerWithinAU: 'Distribution Head', frequency: 'Per Transaction', themeCode: 'T20', auCode: 'AU023', criticality: 'Medium' },

  // ── AU024 Retail Risk Analytics ──────────────────────────────────────
  { code: 'OBL031', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/MRG', regulationName: 'Model Risk Governance', referenceParagraph: 'Para 3.1', description: 'Maintain model inventory and conduct annual validation of all risk models in production.', ownerWithinAU: 'Analytics Head', frequency: 'Annual', themeCode: 'T10', auCode: 'AU024', criticality: 'High' },

  // ── AU025 Loan Against Property ──────────────────────────────────────
  { code: 'OBL032', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/45', regulationName: 'Master Direction on Lending', referenceParagraph: 'Para 9.1', description: 'Ensure property valuation by empanelled valuers and maintain LTV within prescribed limits.', ownerWithinAU: 'LAP Manager', frequency: 'Per Loan', themeCode: 'T03', auCode: 'AU025', criticality: 'Medium' },

  // ── AU026 Large Clients Group ────────────────────────────────────────
  { code: 'OBL033', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/LEF', regulationName: 'Large Exposure Framework', referenceParagraph: 'Para 4.1', description: 'Ensure single borrower exposure does not exceed 20% of Tier 1 capital.', ownerWithinAU: 'Relationship Manager', frequency: 'Quarterly', themeCode: 'T03', auCode: 'AU026', criticality: 'Critical' },
  { code: 'OBL034', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/LEF', regulationName: 'Large Exposure Framework', referenceParagraph: 'Para 5.2', description: 'Report large exposures to RBI within prescribed timelines and maintain group exposure limits.', ownerWithinAU: 'Credit Admin', frequency: 'Monthly', themeCode: 'T03', auCode: 'AU026', criticality: 'High' },

  // ── AU027 Mid Corporate ──────────────────────────────────────────────
  { code: 'OBL035', regulationSource: 'RBI', regulationRef: 'RBI/2022-23/WC', regulationName: 'Working Capital Assessment', referenceParagraph: 'Para 3.1', description: 'Conduct working capital assessment using Turnover Method or MPBF method as applicable.', ownerWithinAU: 'Credit Analyst', frequency: 'Annual', themeCode: 'T03', auCode: 'AU027', criticality: 'High' },

  // ── AU028 Trade Finance Operations Group (Demo: LC Issuance Compliance) ──
  { code: 'OBL036', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/TF', regulationName: 'Trade Finance Compliance Framework', referenceParagraph: 'Para 6.1', description: 'LC Issuance Compliance — Ensure all Letter of Credit issuances comply with UCPDC 600 norms, FEMA regulations, and internal credit approval matrix with maker-checker verification.', ownerWithinAU: 'Trade Finance Head', frequency: 'Per Transaction', themeCode: 'T06', auCode: 'AU028', criticality: 'Critical' },
  { code: 'OBL037', regulationSource: 'RBI', regulationRef: 'FEMA/2023/TF', regulationName: 'FEMA Trade Finance Regulations', referenceParagraph: 'Reg 8', description: 'Ensure trade finance transactions comply with FEMA regulations including eBRC filing and EDPMS reporting.', ownerWithinAU: 'FEMA Compliance Officer', frequency: 'Per Transaction', themeCode: 'T06', auCode: 'AU028', criticality: 'High' },

  // ── AU029 Structured Finance ─────────────────────────────────────────
  { code: 'OBL038', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/SF', regulationName: 'Securitisation Guidelines', referenceParagraph: 'Para 4.1', description: 'Ensure securitisation transactions comply with RBI guidelines on MRR and MHP.', ownerWithinAU: 'Structured Finance Head', frequency: 'Per Transaction', themeCode: 'T03', auCode: 'AU029', criticality: 'High' },

  // ── AU030 Corporate Credit Risk ──────────────────────────────────────
  { code: 'OBL039', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/CRILC', regulationName: 'CRILC Reporting', referenceParagraph: 'Para 2.1', description: 'Report all borrowers with aggregate exposure ≥₹5 Cr to CRILC on monthly basis.', ownerWithinAU: 'Credit Risk Head', frequency: 'Monthly', themeCode: 'T10', auCode: 'AU030', criticality: 'Critical' },

  // ── AU031 Transaction Banking ────────────────────────────────────────
  { code: 'OBL040', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/PSS', regulationName: 'Payment Systems Regulations', referenceParagraph: 'Para 8.1', description: 'Ensure RTGS/NEFT processing within prescribed timelines and maintain STP rates above 95%.', ownerWithinAU: 'Transaction Banking Head', frequency: 'Daily', themeCode: 'T05', auCode: 'AU031', criticality: 'High' },

  // ── AU032 Supply Chain Finance ───────────────────────────────────────
  { code: 'OBL041', regulationSource: 'RBI', regulationRef: 'RBI/2022-23/SCF', regulationName: 'Supply Chain Finance Framework', referenceParagraph: 'Para 3.1', description: 'Ensure SCF programs have proper anchor-dealer agreements and credit risk assessment.', ownerWithinAU: 'SCF Head', frequency: 'Per Program', themeCode: 'T03', auCode: 'AU032', criticality: 'Medium' },

  // ── AU033 SME Banking ────────────────────────────────────────────────
  { code: 'OBL042', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/MSME', regulationName: 'MSME Lending Guidelines', referenceParagraph: 'Para 4.1', description: 'Process MSME loan applications within 59 minutes under PSB Loans in 59 Minutes scheme.', ownerWithinAU: 'SME Head', frequency: 'Ongoing', themeCode: 'T03', auCode: 'AU033', criticality: 'High' },

  // ── AU034 Corporate Liabilities ──────────────────────────────────────
  { code: 'OBL043', regulationSource: 'RBI', regulationRef: 'RBI/2022-23/DEP', regulationName: 'Deposit Regulations', referenceParagraph: 'Para 5.1', description: 'Ensure corporate deposit interest rates comply with RBI directives and maintain proper documentation.', ownerWithinAU: 'Corporate Deposits Head', frequency: 'Ongoing', themeCode: 'T02', auCode: 'AU034', criticality: 'Medium' },

  // ── AU035 Investment Banking ─────────────────────────────────────────
  { code: 'OBL044', regulationSource: 'SEBI', regulationRef: 'SEBI/2023/MB', regulationName: 'Merchant Banking Regulations', referenceParagraph: 'Reg 20', description: 'Ensure IPO due diligence and disclosure compliance as per SEBI merchant banking regulations.', ownerWithinAU: 'IB Head', frequency: 'Per Deal', themeCode: 'T04', auCode: 'AU035', criticality: 'High' },

  // ── AU036 Trustee Services ───────────────────────────────────────────
  { code: 'OBL045', regulationSource: 'SEBI', regulationRef: 'SEBI/2022/DT', regulationName: 'Debenture Trustee Regulations', referenceParagraph: 'Reg 15', description: 'Monitor debenture issuer compliance with covenants and report defaults to SEBI within prescribed timelines.', ownerWithinAU: 'Trustee Head', frequency: 'Quarterly', themeCode: 'T09', auCode: 'AU036', criticality: 'High' },

  // ── AU037 Corporate Recovery ─────────────────────────────────────────
  { code: 'OBL046', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/RES', regulationName: 'Resolution Framework', referenceParagraph: 'Para 3.1', description: 'Implement resolution plan for stressed assets within 180 days as per RBI prudential framework.', ownerWithinAU: 'Recovery Head', frequency: 'Per Case', themeCode: 'T03', auCode: 'AU037', criticality: 'Critical' },

  // ── AU038 Government Banking ─────────────────────────────────────────
  { code: 'OBL047', regulationSource: 'RBI', regulationRef: 'RBI/2022-23/GA', regulationName: 'Government Account Guidelines', referenceParagraph: 'Para 4.1', description: 'Ensure timely pension disbursement and government account reconciliation within T+1.', ownerWithinAU: 'Govt Banking Head', frequency: 'Daily', themeCode: 'T02', auCode: 'AU038', criticality: 'High' },

  // ── AU039 Correspondent Banking ──────────────────────────────────────
  { code: 'OBL048', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/CB', regulationName: 'Correspondent Banking Guidelines', referenceParagraph: 'Para 5.1', description: 'Conduct annual due diligence of correspondent banking relationships and maintain updated KYC.', ownerWithinAU: 'Correspondent Banking Head', frequency: 'Annual', themeCode: 'T06', auCode: 'AU039', criticality: 'High' },

  // ── AU040 Commodity Finance ──────────────────────────────────────────
  { code: 'OBL049', regulationSource: 'RBI', regulationRef: 'RBI/2022-23/CF', regulationName: 'Commodity Finance Norms', referenceParagraph: 'Para 3.2', description: 'Verify warehouse receipts and ensure commodity collateral valuation at prescribed intervals.', ownerWithinAU: 'Commodity Finance Head', frequency: 'Monthly', themeCode: 'T03', auCode: 'AU040', criticality: 'Medium' },

  // ── AU041 Corporate Product Development ──────────────────────────────
  { code: 'OBL050', regulationSource: 'RBI', regulationRef: 'RBI/2021-22/PD', regulationName: 'Product Approval Process', referenceParagraph: 'Para 3.1', description: 'Ensure new corporate products undergo compliance review and board approval before launch.', ownerWithinAU: 'Product Development Head', frequency: 'Per Product', themeCode: 'T19', auCode: 'AU041', criticality: 'Medium' },

  // ── AU042 Syndication Desk ───────────────────────────────────────────
  { code: 'OBL051', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/SYN', regulationName: 'Consortium Lending Guidelines', referenceParagraph: 'Para 4.1', description: 'Ensure consortium/syndication arrangements comply with RBI guidelines on information sharing and lead bank responsibilities.', ownerWithinAU: 'Syndication Head', frequency: 'Per Deal', themeCode: 'T03', auCode: 'AU042', criticality: 'Medium' },

  // ── AU043 Real Estate Finance ────────────────────────────────────────
  { code: 'OBL052', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/CRE', regulationName: 'Commercial Real Estate Norms', referenceParagraph: 'Para 5.1', description: 'Ensure CRE exposure limits and risk weights comply with RBI prudential norms.', ownerWithinAU: 'RE Finance Head', frequency: 'Quarterly', themeCode: 'T03', auCode: 'AU043', criticality: 'High' },

  // ── AU044 Infrastructure Finance ─────────────────────────────────────
  { code: 'OBL053', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/IF', regulationName: 'Infrastructure Finance Guidelines', referenceParagraph: 'Para 3.1', description: 'Ensure infrastructure project appraisal includes independent technical evaluation and environmental clearance verification.', ownerWithinAU: 'Infra Finance Head', frequency: 'Per Project', themeCode: 'T03', auCode: 'AU044', criticality: 'High' },

  // ── AU045 Financial Institutions Group ───────────────────────────────
  { code: 'OBL054', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/NBFC', regulationName: 'NBFC Exposure Norms', referenceParagraph: 'Para 4.1', description: 'Monitor NBFC exposure concentration and ensure compliance with sectoral exposure limits.', ownerWithinAU: 'FIG Head', frequency: 'Monthly', themeCode: 'T03', auCode: 'AU045', criticality: 'High' },

  // ── AU046 Markets Group ──────────────────────────────────────────────
  { code: 'OBL055', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/MKT', regulationName: 'Market Risk Management', referenceParagraph: 'Para 6.1', description: 'Maintain VaR limits and ensure daily mark-to-market of trading book positions.', ownerWithinAU: 'Markets Head', frequency: 'Daily', themeCode: 'T04', auCode: 'AU046', criticality: 'Critical' },

  // ── AU047 Proprietary Trading ────────────────────────────────────────
  { code: 'OBL056', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/INV', regulationName: 'Investment Portfolio Guidelines', referenceParagraph: 'Para 4.2', description: 'Ensure proprietary trading positions comply with board-approved risk limits and stop-loss triggers.', ownerWithinAU: 'Prop Trading Head', frequency: 'Daily', themeCode: 'T04', auCode: 'AU047', criticality: 'High' },

  // ── AU048 Treasury Control ───────────────────────────────────────────
  { code: 'OBL057', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/TC', regulationName: 'Treasury Control Framework', referenceParagraph: 'Para 3.1', description: 'Ensure independent P&L verification and limit monitoring with breach escalation within 30 minutes.', ownerWithinAU: 'Treasury Controller', frequency: 'Daily', themeCode: 'T04', auCode: 'AU048', criticality: 'Critical' },

  // ── AU049 Foreign Exchange Desk ──────────────────────────────────────
  { code: 'OBL058', regulationSource: 'RBI', regulationRef: 'FEMA/2023/FX', regulationName: 'FEMA Forex Regulations', referenceParagraph: 'Reg 3', description: 'Ensure forex transactions comply with FEMA regulations and AD Category I license conditions.', ownerWithinAU: 'Forex Desk Head', frequency: 'Per Transaction', themeCode: 'T06', auCode: 'AU049', criticality: 'Critical' },

  // ── AU050 ALM and Liquidity ──────────────────────────────────────────
  { code: 'OBL059', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/LCR', regulationName: 'Liquidity Coverage Ratio', referenceParagraph: 'Para 2.1', description: 'Maintain LCR above 100% and NSFR above 100% as per Basel III liquidity norms.', ownerWithinAU: 'ALM Head', frequency: 'Daily', themeCode: 'T10', auCode: 'AU050', criticality: 'Critical' },
  { code: 'OBL060', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/ALM', regulationName: 'ALM Guidelines', referenceParagraph: 'Para 4.1', description: 'Submit structural liquidity statement to RBI on fortnightly basis with maturity bucket analysis.', ownerWithinAU: 'ALM Analyst', frequency: 'Fortnightly', themeCode: 'T10', auCode: 'AU050', criticality: 'High' },

  // ── AU051 Derivatives Desk ───────────────────────────────────────────
  { code: 'OBL061', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/DER', regulationName: 'Derivatives Guidelines', referenceParagraph: 'Para 5.1', description: 'Ensure OTC derivative transactions have proper ISDA documentation and margin requirements.', ownerWithinAU: 'Derivatives Head', frequency: 'Per Transaction', themeCode: 'T04', auCode: 'AU051', criticality: 'High' },

  // ── AU052 Money Market Desk ──────────────────────────────────────────
  { code: 'OBL062', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/MM', regulationName: 'Money Market Regulations', referenceParagraph: 'Para 3.1', description: 'Ensure call money borrowing/lending within prescribed limits and report to CCIL on same day.', ownerWithinAU: 'Money Market Head', frequency: 'Daily', themeCode: 'T04', auCode: 'AU052', criticality: 'High' },

  // ── AU053 Investment Portfolio ────────────────────────────────────────
  { code: 'OBL063', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/INV', regulationName: 'Investment Portfolio Classification', referenceParagraph: 'Para 2.1', description: 'Classify investment portfolio into HTM/AFS/FVTPL as per RBI investment classification norms.', ownerWithinAU: 'Investment Head', frequency: 'Quarterly', themeCode: 'T04', auCode: 'AU053', criticality: 'High' },
  { code: 'OBL064', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/SLR', regulationName: 'SLR Maintenance', referenceParagraph: 'Para 1.1', description: 'Maintain SLR at prescribed percentage of NDTL and report daily to RBI.', ownerWithinAU: 'SLR Compliance Officer', frequency: 'Daily', themeCode: 'T04', auCode: 'AU053', criticality: 'Critical' },

  // ── AU054 Treasury Sales ─────────────────────────────────────────────
  { code: 'OBL065', regulationSource: 'RBI', regulationRef: 'RBI/2022-23/TS', regulationName: 'Treasury Product Suitability', referenceParagraph: 'Para 4.1', description: 'Ensure suitability assessment for corporate treasury product sales and maintain customer appropriateness records.', ownerWithinAU: 'Treasury Sales Head', frequency: 'Per Transaction', themeCode: 'T04', auCode: 'AU054', criticality: 'Medium' },

  // ── AU055 Treasury Operations ────────────────────────────────────────
  { code: 'OBL066', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/SET', regulationName: 'Settlement Guidelines', referenceParagraph: 'Para 3.1', description: 'Ensure T+1 settlement for government securities and T+2 for corporate bonds.', ownerWithinAU: 'Treasury Ops Head', frequency: 'Daily', themeCode: 'T04', auCode: 'AU055', criticality: 'High' },

  // ── AU056 Equity Trading ─────────────────────────────────────────────
  { code: 'OBL067', regulationSource: 'SEBI', regulationRef: 'SEBI/2023/EQ', regulationName: 'Equity Trading Regulations', referenceParagraph: 'Reg 10', description: 'Ensure equity trading complies with SEBI insider trading regulations and position limits.', ownerWithinAU: 'Equity Trading Head', frequency: 'Daily', themeCode: 'T04', auCode: 'AU056', criticality: 'High' },

  // ── AU057 Commodities Desk ───────────────────────────────────────────
  { code: 'OBL068', regulationSource: 'SEBI', regulationRef: 'SEBI/2023/CMD', regulationName: 'Commodity Derivatives Regulations', referenceParagraph: 'Reg 8', description: 'Ensure commodity derivatives positions comply with SEBI position limits and margin requirements.', ownerWithinAU: 'Commodities Head', frequency: 'Daily', themeCode: 'T04', auCode: 'AU057', criticality: 'Medium' },

  // ── AU058 Treasury Risk Management ───────────────────────────────────
  { code: 'OBL069', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/MR', regulationName: 'Market Risk Framework', referenceParagraph: 'Para 5.1', description: 'Compute and report VaR, stressed VaR, and incremental risk charge as per Basel III market risk framework.', ownerWithinAU: 'Market Risk Head', frequency: 'Daily', themeCode: 'T10', auCode: 'AU058', criticality: 'Critical' },

  // ── AU059 Collateral Management ──────────────────────────────────────
  { code: 'OBL070', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/COL', regulationName: 'Collateral Management Guidelines', referenceParagraph: 'Para 3.1', description: 'Ensure daily margin calls and collateral valuation for derivative and repo transactions.', ownerWithinAU: 'Collateral Manager', frequency: 'Daily', themeCode: 'T04', auCode: 'AU059', criticality: 'High' },

  // ── AU060 Treasury Technology ────────────────────────────────────────
  { code: 'OBL071', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/IT', regulationName: 'IT Governance Framework', referenceParagraph: 'Para 8.1', description: 'Ensure treasury systems have adequate DR capability with RPO <4 hours and RTO <2 hours.', ownerWithinAU: 'Treasury Tech Head', frequency: 'Quarterly', themeCode: 'T11', auCode: 'AU060', criticality: 'High' },

  // ── AU061 Business Technology ────────────────────────────────────────
  { code: 'OBL072', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/IT', regulationName: 'IT Governance Framework', referenceParagraph: 'Para 3.1', description: 'Implement IT governance framework with board-approved IT strategy and risk management.', ownerWithinAU: 'CTO', frequency: 'Annual', themeCode: 'T11', auCode: 'AU061', criticality: 'High' },
  { code: 'OBL073', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/IT', regulationName: 'IT Governance Framework', referenceParagraph: 'Para 6.2', description: 'Ensure patch management compliance with critical patches applied within 72 hours.', ownerWithinAU: 'IT Security Lead', frequency: 'Ongoing', themeCode: 'T11', auCode: 'AU061', criticality: 'Critical' },

  // ── AU062 Compliance Group ───────────────────────────────────────────
  { code: 'OBL074', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/CF', regulationName: 'Compliance Function Guidelines', referenceParagraph: 'Para 4.1', description: 'Submit annual compliance report to board and maintain compliance risk assessment for all business lines.', ownerWithinAU: 'Chief Compliance Officer', frequency: 'Annual', themeCode: 'T16', auCode: 'AU062', criticality: 'High' },

  // ── AU063 Internal Audit ─────────────────────────────────────────────
  { code: 'OBL075', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/IA', regulationName: 'Internal Audit Framework', referenceParagraph: 'Para 3.1', description: 'Conduct risk-based internal audit covering all business lines with annual audit plan approved by ACB.', ownerWithinAU: 'Chief Audit Executive', frequency: 'Annual', themeCode: 'T16', auCode: 'AU063', criticality: 'High' },

  // ── AU064 HRMG ───────────────────────────────────────────────────────
  { code: 'OBL076', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/HR', regulationName: 'Compensation Guidelines', referenceParagraph: 'Para 5.1', description: 'Ensure compensation policy compliance with RBI guidelines on variable pay and clawback provisions.', ownerWithinAU: 'HR Head', frequency: 'Annual', themeCode: 'T17', auCode: 'AU064', criticality: 'Medium' },

  // ── AU065 Legal Department ───────────────────────────────────────────
  { code: 'OBL077', regulationSource: 'RBI', regulationRef: 'RBI/2022-23/LG', regulationName: 'Legal Compliance Framework', referenceParagraph: 'Para 2.1', description: 'Maintain updated legal opinion on all standard banking products and review annually.', ownerWithinAU: 'Legal Head', frequency: 'Annual', themeCode: 'T09', auCode: 'AU065', criticality: 'Medium' },

  // ── AU066 Finance and Accounts ───────────────────────────────────────
  { code: 'OBL078', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/FR', regulationName: 'Financial Reporting Standards', referenceParagraph: 'Para 2.1', description: 'Prepare financial statements in compliance with Ind AS and submit to RBI within prescribed timelines.', ownerWithinAU: 'CFO', frequency: 'Quarterly', themeCode: 'T14', auCode: 'AU066', criticality: 'Critical' },
  { code: 'OBL079', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/P3', regulationName: 'Pillar 3 Disclosure', referenceParagraph: 'Para 3.1', description: 'Publish Pillar 3 disclosures on bank website within 90 days of quarter end.', ownerWithinAU: 'Disclosure Officer', frequency: 'Quarterly', themeCode: 'T14', auCode: 'AU066', criticality: 'High' },

  // ── AU067 Risk Management Group ──────────────────────────────────────
  { code: 'OBL080', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/ICAAP', regulationName: 'ICAAP Guidelines', referenceParagraph: 'Para 4.1', description: 'Conduct annual ICAAP assessment and submit to RBI as part of supervisory review process.', ownerWithinAU: 'CRO', frequency: 'Annual', themeCode: 'T10', auCode: 'AU067', criticality: 'Critical' },
  { code: 'OBL081', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/ST', regulationName: 'Stress Testing Framework', referenceParagraph: 'Para 3.1', description: 'Conduct quarterly stress tests covering credit, market, and liquidity risk scenarios.', ownerWithinAU: 'Stress Testing Lead', frequency: 'Quarterly', themeCode: 'T10', auCode: 'AU067', criticality: 'High' },

  // ── AU068 Information Security ───────────────────────────────────────
  { code: 'OBL082', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/CS', regulationName: 'Cyber Security Framework', referenceParagraph: 'Para 5.1', description: 'Implement cyber security framework with SOC operations, VAPT, and incident response within prescribed timelines.', ownerWithinAU: 'CISO', frequency: 'Ongoing', themeCode: 'T11', auCode: 'AU068', criticality: 'Critical' },
  { code: 'OBL083', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/CS', regulationName: 'Cyber Security Framework', referenceParagraph: 'Para 7.2', description: 'Report cyber security incidents to RBI-CERT within 6 hours of detection.', ownerWithinAU: 'Incident Response Lead', frequency: 'Per Incident', themeCode: 'T11', auCode: 'AU068', criticality: 'Critical' },

  // ── AU069 Operations and Services ────────────────────────────────────
  { code: 'OBL084', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/OPS', regulationName: 'Operational Risk Framework', referenceParagraph: 'Para 4.1', description: 'Maintain operational risk event database and report material events to board within 24 hours.', ownerWithinAU: 'Operations Head', frequency: 'Ongoing', themeCode: 'T05', auCode: 'AU069', criticality: 'High' },

  // ── AU070 Fraud Risk Management ──────────────────────────────────────
  { code: 'OBL085', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/FRM', regulationName: 'Fraud Risk Management Framework', referenceParagraph: 'Para 3.1', description: 'Report frauds ≥₹1 Lakh to RBI within 7 days and maintain fraud monitoring system with real-time alerts.', ownerWithinAU: 'Fraud Risk Head', frequency: 'Per Incident', themeCode: 'T15', auCode: 'AU070', criticality: 'Critical' },
  { code: 'OBL086', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/FRM', regulationName: 'Fraud Risk Management Framework', referenceParagraph: 'Para 5.2', description: 'Conduct quarterly fraud vulnerability assessment and update fraud risk register.', ownerWithinAU: 'Fraud Analytics Lead', frequency: 'Quarterly', themeCode: 'T15', auCode: 'AU070', criticality: 'High' },

  // ── AU071 Vigilance Department ───────────────────────────────────────
  { code: 'OBL087', regulationSource: 'CVC', regulationRef: 'CVC/2023/01', regulationName: 'CVC Guidelines', referenceParagraph: 'Para 4.1', description: 'Submit monthly vigilance report to CVC and conduct preventive vigilance inspections.', ownerWithinAU: 'CVO', frequency: 'Monthly', themeCode: 'T15', auCode: 'AU071', criticality: 'Medium' },

  // ── AU072 Company Secretary ──────────────────────────────────────────
  { code: 'OBL088', regulationSource: 'SEBI', regulationRef: 'SEBI/LODR/2023', regulationName: 'LODR Regulations', referenceParagraph: 'Reg 30', description: 'Ensure timely disclosure of material events to stock exchanges as per SEBI LODR regulations.', ownerWithinAU: 'Company Secretary', frequency: 'Per Event', themeCode: 'T09', auCode: 'AU072', criticality: 'High' },
  { code: 'OBL089', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/CG', regulationName: 'Corporate Governance Guidelines', referenceParagraph: 'Para 3.1', description: 'Ensure board composition meets RBI fit and proper criteria and independent director requirements.', ownerWithinAU: 'Board Secretariat', frequency: 'Annual', themeCode: 'T09', auCode: 'AU072', criticality: 'High' },

  // ── AU073 Premises and Infrastructure ────────────────────────────────
  { code: 'OBL090', regulationSource: 'RBI', regulationRef: 'RBI/2022-23/PR', regulationName: 'Premises Guidelines', referenceParagraph: 'Para 2.1', description: 'Ensure branch premises comply with RBI accessibility guidelines and security standards.', ownerWithinAU: 'Premises Head', frequency: 'Annual', themeCode: 'T13', auCode: 'AU073', criticality: 'Low' },

  // ── AU074 Procurement ────────────────────────────────────────────────
  { code: 'OBL091', regulationSource: 'RBI', regulationRef: 'RBI/2022-23/VRM', regulationName: 'Vendor Risk Management', referenceParagraph: 'Para 3.1', description: 'Conduct vendor due diligence and maintain approved vendor list with annual review.', ownerWithinAU: 'Procurement Head', frequency: 'Annual', themeCode: 'T12', auCode: 'AU074', criticality: 'Medium' },

  // ── AU075 Data Governance ────────────────────────────────────────────
  { code: 'OBL092', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/DG', regulationName: 'Data Governance Framework', referenceParagraph: 'Para 4.1', description: 'Implement data governance framework with data quality metrics and data lineage for regulatory reporting.', ownerWithinAU: 'CDO', frequency: 'Ongoing', themeCode: 'T21', auCode: 'AU075', criticality: 'High' },
  { code: 'OBL093', regulationSource: 'DPDP', regulationRef: 'DPDP/2023/01', regulationName: 'Digital Personal Data Protection Act', referenceParagraph: 'Sec 5', description: 'Ensure customer data processing complies with DPDP Act consent and purpose limitation requirements.', ownerWithinAU: 'Data Privacy Officer', frequency: 'Ongoing', themeCode: 'T21', auCode: 'AU075', criticality: 'Critical' },

  // ── AU076 Regulatory Affairs ─────────────────────────────────────────
  { code: 'OBL094', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/RR', regulationName: 'Regulatory Returns Framework', referenceParagraph: 'Para 2.1', description: 'Submit all statutory returns (DSB, CRILC, LBS, BSR) to RBI within prescribed timelines.', ownerWithinAU: 'Regulatory Affairs Head', frequency: 'As Prescribed', themeCode: 'T18', auCode: 'AU076', criticality: 'Critical' },

  // ── AU077 Credit Administration ──────────────────────────────────────
  { code: 'OBL095', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/CA', regulationName: 'Credit Administration Norms', referenceParagraph: 'Para 3.1', description: 'Ensure credit documentation completeness and covenant monitoring with quarterly compliance certificates.', ownerWithinAU: 'Credit Admin Head', frequency: 'Quarterly', themeCode: 'T03', auCode: 'AU077', criticality: 'High' },

  // ── AU078 Treasury Middle Office ─────────────────────────────────────
  { code: 'OBL096', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/TMO', regulationName: 'Treasury Middle Office Guidelines', referenceParagraph: 'Para 2.1', description: 'Ensure independent valuation of treasury positions and daily P&L verification.', ownerWithinAU: 'Middle Office Head', frequency: 'Daily', themeCode: 'T04', auCode: 'AU078', criticality: 'High' },

  // ── AU079 Anti-Money Laundering Cell ─────────────────────────────────
  { code: 'OBL097', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/AML', regulationName: 'AML/CFT Master Direction', referenceParagraph: 'Para 8.1', description: 'File STRs with FIU-IND within 7 days of suspicion and maintain transaction monitoring with prescribed thresholds.', ownerWithinAU: 'MLRO', frequency: 'Per Incident', themeCode: 'T01', auCode: 'AU079', criticality: 'Critical' },
  { code: 'OBL098', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/AML', regulationName: 'AML/CFT Master Direction', referenceParagraph: 'Para 10.1', description: 'Conduct sanctions screening for all cross-border transactions against OFAC, UN, and India sanctions lists.', ownerWithinAU: 'Sanctions Officer', frequency: 'Per Transaction', themeCode: 'T01', auCode: 'AU079', criticality: 'Critical' },

  // ── AU080 Customer Grievance Cell ────────────────────────────────────
  { code: 'OBL099', regulationSource: 'RBI', regulationRef: 'RBI/2021-22/IOS', regulationName: 'Integrated Ombudsman Scheme', referenceParagraph: 'Para 6.1', description: 'Resolve customer complaints within 30 days and report unresolved cases to RBI Ombudsman.', ownerWithinAU: 'Grievance Head', frequency: 'Ongoing', themeCode: 'T08', auCode: 'AU080', criticality: 'High' },

  // ── AU081 ICOFR Team ─────────────────────────────────────────────────
  { code: 'OBL100', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/ICOFR', regulationName: 'ICOFR Framework', referenceParagraph: 'Para 3.1', description: 'Test all key ICOFR controls annually and report deficiencies to Audit Committee within 15 days.', ownerWithinAU: 'ICOFR Lead', frequency: 'Annual', themeCode: 'T14', auCode: 'AU081', criticality: 'High' },

  // ── AU082 Business Continuity ────────────────────────────────────────
  { code: 'OBL101', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/BCP', regulationName: 'Business Continuity Guidelines', referenceParagraph: 'Para 4.1', description: 'Conduct BCP/DR drills semi-annually and ensure critical systems have RTO <4 hours.', ownerWithinAU: 'BCM Head', frequency: 'Semi-Annual', themeCode: 'T13', auCode: 'AU082', criticality: 'High' },

  // ── AU083 Outsourcing Management ─────────────────────────────────────
  { code: 'OBL102', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/OS', regulationName: 'Outsourcing Guidelines', referenceParagraph: 'Para 5.1', description: 'Ensure outsourced activities comply with RBI outsourcing guidelines and maintain board-approved outsourcing policy.', ownerWithinAU: 'Outsourcing Head', frequency: 'Annual', themeCode: 'T12', auCode: 'AU083', criticality: 'Medium' },

  // ── AU084 Training Academy ───────────────────────────────────────────
  { code: 'OBL103', regulationSource: 'RBI', regulationRef: 'RBI/2022-23/TR', regulationName: 'Training Requirements', referenceParagraph: 'Para 2.1', description: 'Ensure mandatory compliance training completion for all employees within prescribed timelines.', ownerWithinAU: 'Training Head', frequency: 'Annual', themeCode: 'T17', auCode: 'AU084', criticality: 'Low' },

  // ── AU085 Strategic Planning ─────────────────────────────────────────
  { code: 'OBL104', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/SP', regulationName: 'Strategic Planning Guidelines', referenceParagraph: 'Para 2.1', description: 'Submit annual business plan to RBI and ensure strategic initiatives align with regulatory expectations.', ownerWithinAU: 'Strategy Head', frequency: 'Annual', themeCode: 'T09', auCode: 'AU085', criticality: 'Low' },

  // ── AU086 Investor Relations ─────────────────────────────────────────
  { code: 'OBL105', regulationSource: 'SEBI', regulationRef: 'SEBI/LODR/2023', regulationName: 'LODR Regulations', referenceParagraph: 'Reg 46', description: 'Maintain updated investor information on bank website as per SEBI LODR requirements.', ownerWithinAU: 'IR Head', frequency: 'Quarterly', themeCode: 'T14', auCode: 'AU086', criticality: 'Medium' },

  // ── AU087 Corporate Communications ───────────────────────────────────
  { code: 'OBL106', regulationSource: 'RBI', regulationRef: 'RBI/2022-23/CC', regulationName: 'Communication Guidelines', referenceParagraph: 'Para 3.1', description: 'Ensure all public communications comply with RBI guidelines on advertising and fair practice.', ownerWithinAU: 'Communications Head', frequency: 'Per Communication', themeCode: 'T20', auCode: 'AU087', criticality: 'Low' },

  // ── AU088 Digital Transformation Office ──────────────────────────────
  { code: 'OBL107', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/DT', regulationName: 'Digital Transformation Guidelines', referenceParagraph: 'Para 4.1', description: 'Ensure new digital initiatives undergo regulatory impact assessment before deployment.', ownerWithinAU: 'Digital Transformation Head', frequency: 'Per Initiative', themeCode: 'T11', auCode: 'AU088', criticality: 'Medium' },

  // ── AU089 Priority Sector Lending Cell ───────────────────────────────
  { code: 'OBL108', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/PSL', regulationName: 'Priority Sector Lending Norms', referenceParagraph: 'Para 2.1', description: 'Achieve overall PSL target of 40% of ANBC and submit quarterly PSL returns to RBI.', ownerWithinAU: 'PSL Head', frequency: 'Quarterly', themeCode: 'T03', auCode: 'AU089', criticality: 'Critical' },

  // ── Additional obligations for broader coverage ──────────────────────
  // Extra obligations for high-activity AUs to reach 120+

  // AU001 - additional
  { code: 'OBL109', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/FPC', regulationName: 'Fair Practice Code for Lending', referenceParagraph: 'Para 3.1', description: 'Communicate loan terms, interest rate reset, and prepayment charges transparently to retail borrowers.', ownerWithinAU: 'Retail Lending Head', frequency: 'Per Loan', themeCode: 'T20', auCode: 'AU001', criticality: 'High' },

  // AU002 - additional
  { code: 'OBL110', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/AML', regulationName: 'AML/CFT Master Direction', referenceParagraph: 'Para 12.1', description: 'Conduct periodic KYC updation for existing customers as per risk categorization timelines.', ownerWithinAU: 'KYC Compliance Officer', frequency: 'As Prescribed', themeCode: 'T01', auCode: 'AU002', criticality: 'High' },

  // AU003 - additional
  { code: 'OBL111', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/CARD', regulationName: 'Card Security Standards', referenceParagraph: 'Para 4.1', description: 'Ensure PCI-DSS compliance for card data storage and processing systems.', ownerWithinAU: 'Card Security Lead', frequency: 'Annual', themeCode: 'T11', auCode: 'AU003', criticality: 'Critical' },

  // AU004 - additional (digital lending scenario)
  { code: 'OBL112', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/DL', regulationName: 'Digital Lending Guidelines', referenceParagraph: 'Para 7.1', description: 'Ensure FLDG arrangements with fintech partners comply with RBI first loss default guarantee norms.', ownerWithinAU: 'Partnership Compliance Lead', frequency: 'Per Partnership', themeCode: 'T11', auCode: 'AU004', criticality: 'High' },

  // AU028 - additional
  { code: 'OBL113', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/BG', regulationName: 'Bank Guarantee Guidelines', referenceParagraph: 'Para 3.1', description: 'Ensure bank guarantee issuance follows prescribed approval matrix and collateral requirements.', ownerWithinAU: 'BG Operations Head', frequency: 'Per Transaction', themeCode: 'T06', auCode: 'AU028', criticality: 'High' },

  // AU046 - additional
  { code: 'OBL114', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/MKT', regulationName: 'Market Risk Management', referenceParagraph: 'Para 8.1', description: 'Ensure trading book positions comply with board-approved risk appetite and escalate limit breaches immediately.', ownerWithinAU: 'Trading Risk Manager', frequency: 'Daily', themeCode: 'T04', auCode: 'AU046', criticality: 'High' },

  // AU050 - additional
  { code: 'OBL115', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/CRR', regulationName: 'CRR Maintenance', referenceParagraph: 'Para 1.1', description: 'Maintain CRR at prescribed percentage of NDTL and report daily to RBI.', ownerWithinAU: 'Reserve Management Officer', frequency: 'Daily', themeCode: 'T10', auCode: 'AU050', criticality: 'Critical' },

  // AU062 - additional
  { code: 'OBL116', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/WB', regulationName: 'Whistle Blower Policy', referenceParagraph: 'Para 3.1', description: 'Maintain whistle-blower mechanism and ensure protection of whistle-blowers as per RBI guidelines.', ownerWithinAU: 'Compliance Head', frequency: 'Ongoing', themeCode: 'T16', auCode: 'AU062', criticality: 'Medium' },

  // AU067 - additional
  { code: 'OBL117', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/RAF', regulationName: 'Risk Appetite Framework', referenceParagraph: 'Para 2.1', description: 'Review and update risk appetite statement annually with board approval and cascade to business units.', ownerWithinAU: 'Risk Appetite Manager', frequency: 'Annual', themeCode: 'T10', auCode: 'AU067', criticality: 'High' },

  // AU068 - additional
  { code: 'OBL118', regulationSource: 'CERT-In', regulationRef: 'CERT-In/2022/01', regulationName: 'CERT-In Directions', referenceParagraph: 'Dir 4', description: 'Report cyber incidents to CERT-In within 6 hours and maintain logs for 180 days.', ownerWithinAU: 'SOC Lead', frequency: 'Per Incident', themeCode: 'T11', auCode: 'AU068', criticality: 'Critical' },

  // AU006 - additional
  { code: 'OBL119', regulationSource: 'RBI', regulationRef: 'RBI/2022-23/NACH', regulationName: 'NACH Operations Guidelines', referenceParagraph: 'Para 5.1', description: 'Process NACH mandates within prescribed TAT and maintain dispute resolution mechanism.', ownerWithinAU: 'NACH Operations Lead', frequency: 'Daily', themeCode: 'T05', auCode: 'AU006', criticality: 'Medium' },

  // AU033 - additional
  { code: 'OBL120', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/MSME', regulationName: 'MSME Restructuring Framework', referenceParagraph: 'Para 6.1', description: 'Implement MSME restructuring framework and ensure eligible accounts are restructured within 90 days.', ownerWithinAU: 'MSME Recovery Head', frequency: 'Per Case', themeCode: 'T03', auCode: 'AU033', criticality: 'High' },

  // AU066 - additional
  { code: 'OBL121', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/TAX', regulationName: 'Tax Compliance', referenceParagraph: 'Para 2.1', description: 'Ensure TDS deduction and remittance compliance for all applicable transactions within prescribed timelines.', ownerWithinAU: 'Tax Manager', frequency: 'Monthly', themeCode: 'T14', auCode: 'AU066', criticality: 'High' },

  // AU070 - additional
  { code: 'OBL122', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/EWS', regulationName: 'Early Warning Signal Framework', referenceParagraph: 'Para 3.1', description: 'Implement early warning signal framework for fraud detection with automated triggers and escalation.', ownerWithinAU: 'EWS Lead', frequency: 'Ongoing', themeCode: 'T15', auCode: 'AU070', criticality: 'High' },

  // AU079 - additional
  { code: 'OBL123', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/CTR', regulationName: 'Cash Transaction Reporting', referenceParagraph: 'Para 5.1', description: 'File CTRs for cash transactions ≥₹10 Lakh with FIU-IND within prescribed timelines.', ownerWithinAU: 'CTR Officer', frequency: 'Monthly', themeCode: 'T01', auCode: 'AU079', criticality: 'High' },

  // AU076 - additional
  { code: 'OBL124', regulationSource: 'RBI', regulationRef: 'RBI/2023-24/ISP', regulationName: 'Inspection and Supervision', referenceParagraph: 'Para 2.1', description: 'Ensure timely compliance with RBI inspection observations and submit compliance reports within 90 days.', ownerWithinAU: 'Inspection Liaison', frequency: 'Per Inspection', themeCode: 'T18', auCode: 'AU076', criticality: 'High' },
];

export async function seedObligations(
  prisma: PrismaClient,
  themes: Theme[],
  assessmentUnits: AssessmentUnit[],
): Promise<ComplianceObligation[]> {
  const themeMap = new Map(themes.map((t) => [t.code, t]));
  const auMap = new Map(assessmentUnits.map((au) => [au.code, au]));
  const results: ComplianceObligation[] = [];

  for (const obl of OBLIGATIONS) {
    const theme = themeMap.get(obl.themeCode);
    const au = auMap.get(obl.auCode);
    if (!theme || !au) {
      console.warn(`  ⚠ Skipping obligation ${obl.code}: theme=${obl.themeCode} or au=${obl.auCode} not found`);
      continue;
    }

    const record = await prisma.complianceObligation.upsert({
      where: { code: obl.code },
      update: {
        regulationSource: obl.regulationSource,
        regulationRef: obl.regulationRef,
        regulationName: obl.regulationName,
        referenceParagraph: obl.referenceParagraph,
        description: obl.description,
        ownerWithinAU: obl.ownerWithinAU,
        frequency: obl.frequency,
        themeId: theme.id,
        auId: au.id,
        criticality: obl.criticality,
        isActive: true,
      },
      create: {
        code: obl.code,
        regulationSource: obl.regulationSource,
        regulationRef: obl.regulationRef,
        regulationName: obl.regulationName,
        referenceParagraph: obl.referenceParagraph,
        description: obl.description,
        ownerWithinAU: obl.ownerWithinAU,
        frequency: obl.frequency,
        themeId: theme.id,
        auId: au.id,
        criticality: obl.criticality,
        isActive: true,
      },
    });
    results.push(record);
  }

  console.log(`  ✓ Seeded ${results.length} compliance obligations`);
  return results;
}
