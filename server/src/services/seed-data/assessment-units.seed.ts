/**
 * Seed data for 89 Assessment Units across 4 business areas.
 * Also creates AUThemeMapping, AUVolumeDefinition, AUSystemComplexity, and AUProductComplexity records.
 * Requirements: 1.1, 1.3, 1.4, 27.2
 */
import { PrismaClient, AssessmentUnit, Theme } from '@prisma/client';

interface AUDefinition {
  code: string;
  name: string;
  businessArea: string;
  primaryThemeCode: string;
  additionalThemeCodes: string[];
  ownerName: string;
  description: string;
  volumeDefinition: string;
  currentVolume: number;
  previousVolume: number;
}

// Helper to compute growth percent
function growthPct(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 10000) / 100;
}

// ── Retail Banking (~25 AUs) ──────────────────────────────────────────────
const RETAIL_AUS: AUDefinition[] = [
  { code: 'AU001', name: 'Retail Assets Operations Group', businessArea: 'Retail Banking', primaryThemeCode: 'T03', additionalThemeCodes: ['T01', 'T08'], ownerName: 'Rajesh Kumar', description: 'Manages retail lending operations including home loans, personal loans, and vehicle loans.', volumeDefinition: 'Number of retail loan accounts', currentVolume: 1250000, previousVolume: 1100000 },
  { code: 'AU002', name: 'Branch Banking', businessArea: 'Retail Banking', primaryThemeCode: 'T02', additionalThemeCodes: ['T01', 'T08', 'T19'], ownerName: 'Priya Sharma', description: 'Branch network operations covering customer onboarding, account services, and cash management.', volumeDefinition: 'Number of branch transactions per month', currentVolume: 8500000, previousVolume: 7800000 },
  { code: 'AU003', name: 'Cards Product', businessArea: 'Retail Banking', primaryThemeCode: 'T05', additionalThemeCodes: ['T01', 'T08', 'T15'], ownerName: 'Amit Patel', description: 'Credit card and debit card product management, issuance, and transaction processing.', volumeDefinition: 'Number of active cards', currentVolume: 3200000, previousVolume: 2800000 },
  { code: 'AU004', name: 'Digital Channels and Partnership', businessArea: 'Retail Banking', primaryThemeCode: 'T11', additionalThemeCodes: ['T05', 'T21', 'T08'], ownerName: 'Sneha Reddy', description: 'Digital banking channels including mobile app, internet banking, and fintech partnerships.', volumeDefinition: 'Monthly active digital users', currentVolume: 5600000, previousVolume: 4200000 },
  { code: 'AU005', name: 'Retail Liabilities', businessArea: 'Retail Banking', primaryThemeCode: 'T02', additionalThemeCodes: ['T01', 'T08'], ownerName: 'Vikram Singh', description: 'Savings accounts, current accounts, fixed deposits, and recurring deposits management.', volumeDefinition: 'Number of deposit accounts', currentVolume: 9800000, previousVolume: 9200000 },
  { code: 'AU006', name: 'Liabilities Operations Group', businessArea: 'Retail Banking', primaryThemeCode: 'T02', additionalThemeCodes: ['T01', 'T18', 'T05'], ownerName: 'Meera Nair', description: 'Operations support for liability products including account opening, maintenance, and closure.', volumeDefinition: 'Number of account operations per month', currentVolume: 1500000, previousVolume: 1350000 },
  { code: 'AU007', name: 'Home Loans', businessArea: 'Retail Banking', primaryThemeCode: 'T03', additionalThemeCodes: ['T01', 'T08', 'T20'], ownerName: 'Suresh Menon', description: 'Home loan origination, processing, disbursement, and portfolio management.', volumeDefinition: 'Home loan portfolio value (₹ Cr)', currentVolume: 85000, previousVolume: 72000 },
  { code: 'AU008', name: 'Personal Loans', businessArea: 'Retail Banking', primaryThemeCode: 'T03', additionalThemeCodes: ['T01', 'T15', 'T20'], ownerName: 'Anita Desai', description: 'Personal loan products including instant loans, top-up loans, and consumer durable loans.', volumeDefinition: 'Personal loan portfolio value (₹ Cr)', currentVolume: 32000, previousVolume: 26000 },
  { code: 'AU009', name: 'Vehicle Loans', businessArea: 'Retail Banking', primaryThemeCode: 'T03', additionalThemeCodes: ['T01', 'T08'], ownerName: 'Karthik Iyer', description: 'Vehicle financing including new car loans, used car loans, and two-wheeler loans.', volumeDefinition: 'Vehicle loan portfolio value (₹ Cr)', currentVolume: 18000, previousVolume: 15500 },
  { code: 'AU010', name: 'Education Loans', businessArea: 'Retail Banking', primaryThemeCode: 'T03', additionalThemeCodes: ['T08', 'T20'], ownerName: 'Deepa Joshi', description: 'Education loan products for domestic and overseas studies.', volumeDefinition: 'Education loan portfolio value (₹ Cr)', currentVolume: 4500, previousVolume: 4000 },
  { code: 'AU011', name: 'Wealth Management', businessArea: 'Retail Banking', primaryThemeCode: 'T04', additionalThemeCodes: ['T01', 'T07', 'T20'], ownerName: 'Rohit Agarwal', description: 'Wealth management and private banking services for HNI and ultra-HNI customers.', volumeDefinition: 'AUM value (₹ Cr)', currentVolume: 125000, previousVolume: 105000 },
  { code: 'AU012', name: 'NRI Banking', businessArea: 'Retail Banking', primaryThemeCode: 'T06', additionalThemeCodes: ['T01', 'T02', 'T05'], ownerName: 'Pooja Gupta', description: 'NRI account services, remittances, and cross-border banking products.', volumeDefinition: 'Number of NRI accounts', currentVolume: 450000, previousVolume: 420000 },
  { code: 'AU013', name: 'Retail Collections', businessArea: 'Retail Banking', primaryThemeCode: 'T03', additionalThemeCodes: ['T08', 'T15'], ownerName: 'Manoj Tiwari', description: 'Loan recovery and collections operations for retail lending portfolio.', volumeDefinition: 'Number of overdue accounts', currentVolume: 85000, previousVolume: 72000 },
  { code: 'AU014', name: 'Retail Credit Risk', businessArea: 'Retail Banking', primaryThemeCode: 'T10', additionalThemeCodes: ['T03', 'T14'], ownerName: 'Sanjay Verma', description: 'Credit risk assessment, scoring models, and portfolio risk monitoring for retail segment.', volumeDefinition: 'Number of credit decisions per month', currentVolume: 180000, previousVolume: 155000 },
  { code: 'AU015', name: 'Bancassurance', businessArea: 'Retail Banking', primaryThemeCode: 'T07', additionalThemeCodes: ['T08', 'T20'], ownerName: 'Kavita Rao', description: 'Insurance product distribution through banking channels.', volumeDefinition: 'Number of policies sold per quarter', currentVolume: 95000, previousVolume: 82000 },
  { code: 'AU016', name: 'Retail Payments', businessArea: 'Retail Banking', primaryThemeCode: 'T05', additionalThemeCodes: ['T11', 'T15'], ownerName: 'Arjun Nath', description: 'Retail payment processing including UPI, IMPS, bill payments, and merchant services.', volumeDefinition: 'Monthly payment transactions', currentVolume: 45000000, previousVolume: 35000000 },
  { code: 'AU017', name: 'Gold Loans', businessArea: 'Retail Banking', primaryThemeCode: 'T03', additionalThemeCodes: ['T01', 'T08'], ownerName: 'Lakshmi Pillai', description: 'Gold loan origination, valuation, and portfolio management.', volumeDefinition: 'Gold loan portfolio value (₹ Cr)', currentVolume: 12000, previousVolume: 10500 },
  { code: 'AU018', name: 'Microfinance', businessArea: 'Retail Banking', primaryThemeCode: 'T03', additionalThemeCodes: ['T08', 'T20', 'T01'], ownerName: 'Ramesh Babu', description: 'Microfinance and priority sector lending operations.', volumeDefinition: 'Number of microfinance accounts', currentVolume: 320000, previousVolume: 280000 },
  { code: 'AU019', name: 'Retail Product Development', businessArea: 'Retail Banking', primaryThemeCode: 'T19', additionalThemeCodes: ['T08', 'T20'], ownerName: 'Nisha Kapoor', description: 'New retail product design, pricing, and launch management.', volumeDefinition: 'Number of active retail products', currentVolume: 85, previousVolume: 78 },
  { code: 'AU020', name: 'Customer Service Centre', businessArea: 'Retail Banking', primaryThemeCode: 'T08', additionalThemeCodes: ['T21', 'T12'], ownerName: 'Arun Saxena', description: 'Contact centre operations, customer query resolution, and service quality management.', volumeDefinition: 'Monthly customer interactions', currentVolume: 2800000, previousVolume: 2500000 },
  { code: 'AU021', name: 'ATM and Self-Service', businessArea: 'Retail Banking', primaryThemeCode: 'T05', additionalThemeCodes: ['T11', 'T19'], ownerName: 'Divya Menon', description: 'ATM network management, cash recyclers, and self-service kiosk operations.', volumeDefinition: 'Number of ATM transactions per month', currentVolume: 12000000, previousVolume: 11500000 },
  { code: 'AU022', name: 'Rural and Agri Banking', businessArea: 'Retail Banking', primaryThemeCode: 'T03', additionalThemeCodes: ['T01', 'T08', 'T18'], ownerName: 'Ganesh Patil', description: 'Agricultural lending, rural banking services, and priority sector compliance.', volumeDefinition: 'Agri loan portfolio value (₹ Cr)', currentVolume: 28000, previousVolume: 24000 },
  { code: 'AU023', name: 'Third Party Products', businessArea: 'Retail Banking', primaryThemeCode: 'T20', additionalThemeCodes: ['T07', 'T08'], ownerName: 'Sunita Choudhary', description: 'Distribution of mutual funds, insurance, and other third-party financial products.', volumeDefinition: 'Third party AUM (₹ Cr)', currentVolume: 45000, previousVolume: 38000 },
  { code: 'AU024', name: 'Retail Risk Analytics', businessArea: 'Retail Banking', primaryThemeCode: 'T10', additionalThemeCodes: ['T11', 'T14'], ownerName: 'Vivek Mishra', description: 'Data analytics and modelling for retail risk management and portfolio optimization.', volumeDefinition: 'Number of risk models in production', currentVolume: 42, previousVolume: 35 },
  { code: 'AU025', name: 'Loan Against Property', businessArea: 'Retail Banking', primaryThemeCode: 'T03', additionalThemeCodes: ['T01', 'T08'], ownerName: 'Neha Srivastava', description: 'Loan against property origination, valuation, and portfolio management.', volumeDefinition: 'LAP portfolio value (₹ Cr)', currentVolume: 22000, previousVolume: 19000 },
];

// ── Corporate/Wholesale Banking (~20 AUs) ─────────────────────────────────
const CORPORATE_AUS: AUDefinition[] = [
  { code: 'AU026', name: 'Large Clients Group', businessArea: 'Corporate/Wholesale Banking', primaryThemeCode: 'T03', additionalThemeCodes: ['T01', 'T10'], ownerName: 'Ashok Mehta', description: 'Relationship management and credit facilities for large corporate clients.', volumeDefinition: 'Large corporate loan portfolio (₹ Cr)', currentVolume: 180000, previousVolume: 165000 },
  { code: 'AU027', name: 'Mid Corporate', businessArea: 'Corporate/Wholesale Banking', primaryThemeCode: 'T03', additionalThemeCodes: ['T01', 'T10', 'T20'], ownerName: 'Ravi Shankar', description: 'Mid-market corporate banking including working capital and term loans.', volumeDefinition: 'Mid corporate loan portfolio (₹ Cr)', currentVolume: 95000, previousVolume: 85000 },
  { code: 'AU028', name: 'Trade Finance Operations Group', businessArea: 'Corporate/Wholesale Banking', primaryThemeCode: 'T06', additionalThemeCodes: ['T01', 'T05', 'T15'], ownerName: 'Prakash Jain', description: 'Trade finance operations including LCs, bank guarantees, bills discounting, and export/import financing.', volumeDefinition: 'Trade finance volume (₹ Cr)', currentVolume: 42000, previousVolume: 38000 },
  { code: 'AU029', name: 'Structured Finance', businessArea: 'Corporate/Wholesale Banking', primaryThemeCode: 'T03', additionalThemeCodes: ['T04', 'T10'], ownerName: 'Nitin Goyal', description: 'Structured lending, project finance, and syndication services.', volumeDefinition: 'Structured finance portfolio (₹ Cr)', currentVolume: 55000, previousVolume: 48000 },
  { code: 'AU030', name: 'Corporate Credit Risk', businessArea: 'Corporate/Wholesale Banking', primaryThemeCode: 'T10', additionalThemeCodes: ['T03', 'T14'], ownerName: 'Alok Sinha', description: 'Credit risk assessment and monitoring for corporate and wholesale banking portfolio.', volumeDefinition: 'Number of corporate credit reviews per quarter', currentVolume: 850, previousVolume: 780 },
  { code: 'AU031', name: 'Transaction Banking', businessArea: 'Corporate/Wholesale Banking', primaryThemeCode: 'T05', additionalThemeCodes: ['T11', 'T01'], ownerName: 'Siddharth Das', description: 'Cash management, payments, collections, and liquidity management for corporate clients.', volumeDefinition: 'Monthly corporate payment transactions', currentVolume: 5500000, previousVolume: 4800000 },
  { code: 'AU032', name: 'Supply Chain Finance', businessArea: 'Corporate/Wholesale Banking', primaryThemeCode: 'T03', additionalThemeCodes: ['T05', 'T11'], ownerName: 'Manish Khanna', description: 'Supply chain financing, vendor financing, and dealer financing programs.', volumeDefinition: 'SCF portfolio value (₹ Cr)', currentVolume: 18000, previousVolume: 14500 },
  { code: 'AU033', name: 'SME Banking', businessArea: 'Corporate/Wholesale Banking', primaryThemeCode: 'T03', additionalThemeCodes: ['T01', 'T08', 'T20'], ownerName: 'Geeta Krishnan', description: 'Small and medium enterprise banking including MSME loans and business banking.', volumeDefinition: 'SME loan portfolio (₹ Cr)', currentVolume: 48000, previousVolume: 42000 },
  { code: 'AU034', name: 'Corporate Liabilities', businessArea: 'Corporate/Wholesale Banking', primaryThemeCode: 'T02', additionalThemeCodes: ['T01', 'T05'], ownerName: 'Harsh Vardhan', description: 'Corporate deposit products, escrow accounts, and institutional liability management.', volumeDefinition: 'Corporate deposit base (₹ Cr)', currentVolume: 220000, previousVolume: 200000 },
  { code: 'AU035', name: 'Investment Banking', businessArea: 'Corporate/Wholesale Banking', primaryThemeCode: 'T04', additionalThemeCodes: ['T09', 'T14'], ownerName: 'Pallavi Bhat', description: 'Capital markets advisory, IPO management, and M&A advisory services.', volumeDefinition: 'Deal pipeline value (₹ Cr)', currentVolume: 15000, previousVolume: 12000 },
  { code: 'AU036', name: 'Trustee Services', businessArea: 'Corporate/Wholesale Banking', primaryThemeCode: 'T09', additionalThemeCodes: ['T14', 'T03'], ownerName: 'Vinod Kapoor', description: 'Trustee and custodian services for debentures, mutual funds, and securitization transactions.', volumeDefinition: 'Assets under trusteeship (₹ Cr)', currentVolume: 85000, previousVolume: 78000 },
  { code: 'AU037', name: 'Corporate Recovery', businessArea: 'Corporate/Wholesale Banking', primaryThemeCode: 'T03', additionalThemeCodes: ['T15', 'T08'], ownerName: 'Ajay Bhatt', description: 'Stressed asset management, NCLT proceedings, and corporate debt restructuring.', volumeDefinition: 'Stressed assets under management (₹ Cr)', currentVolume: 12000, previousVolume: 15000 },
  { code: 'AU038', name: 'Government Banking', businessArea: 'Corporate/Wholesale Banking', primaryThemeCode: 'T02', additionalThemeCodes: ['T05', 'T18'], ownerName: 'Shashi Bhushan', description: 'Government account management, pension disbursement, and public sector banking services.', volumeDefinition: 'Government account transactions per month', currentVolume: 3200000, previousVolume: 2900000 },
  { code: 'AU039', name: 'Correspondent Banking', businessArea: 'Corporate/Wholesale Banking', primaryThemeCode: 'T06', additionalThemeCodes: ['T01', 'T05'], ownerName: 'Raghav Menon', description: 'Correspondent banking relationships, nostro/vostro account management, and cross-border settlements.', volumeDefinition: 'Number of correspondent banking relationships', currentVolume: 185, previousVolume: 178 },
  { code: 'AU040', name: 'Commodity Finance', businessArea: 'Corporate/Wholesale Banking', primaryThemeCode: 'T03', additionalThemeCodes: ['T06', 'T10'], ownerName: 'Dinesh Agrawal', description: 'Commodity-backed financing, warehouse receipt financing, and commodity hedging.', volumeDefinition: 'Commodity finance portfolio (₹ Cr)', currentVolume: 8500, previousVolume: 7200 },
  { code: 'AU041', name: 'Corporate Product Development', businessArea: 'Corporate/Wholesale Banking', primaryThemeCode: 'T19', additionalThemeCodes: ['T03', 'T20'], ownerName: 'Swati Jha', description: 'New corporate product design, pricing, and go-to-market strategy.', volumeDefinition: 'Number of active corporate products', currentVolume: 52, previousVolume: 48 },
  { code: 'AU042', name: 'Syndication Desk', businessArea: 'Corporate/Wholesale Banking', primaryThemeCode: 'T03', additionalThemeCodes: ['T04', 'T10'], ownerName: 'Pankaj Mishra', description: 'Loan syndication, underwriting, and distribution of large credit facilities.', volumeDefinition: 'Syndication volume (₹ Cr)', currentVolume: 35000, previousVolume: 30000 },
  { code: 'AU043', name: 'Real Estate Finance', businessArea: 'Corporate/Wholesale Banking', primaryThemeCode: 'T03', additionalThemeCodes: ['T10', 'T14'], ownerName: 'Aarti Kulkarni', description: 'Commercial real estate financing, construction finance, and real estate fund management.', volumeDefinition: 'Real estate finance portfolio (₹ Cr)', currentVolume: 28000, previousVolume: 25000 },
  { code: 'AU044', name: 'Infrastructure Finance', businessArea: 'Corporate/Wholesale Banking', primaryThemeCode: 'T03', additionalThemeCodes: ['T10', 'T14'], ownerName: 'Sunil Yadav', description: 'Infrastructure project financing, PPP projects, and long-term infrastructure lending.', volumeDefinition: 'Infrastructure finance portfolio (₹ Cr)', currentVolume: 42000, previousVolume: 38000 },
  { code: 'AU045', name: 'Financial Institutions Group', businessArea: 'Corporate/Wholesale Banking', primaryThemeCode: 'T03', additionalThemeCodes: ['T01', 'T06'], ownerName: 'Rekha Sharma', description: 'Banking relationships with NBFCs, insurance companies, mutual funds, and other financial institutions.', volumeDefinition: 'FIG exposure (₹ Cr)', currentVolume: 65000, previousVolume: 58000 },
];

// ── Treasury and Markets (~15 AUs) ────────────────────────────────────────
const TREASURY_AUS: AUDefinition[] = [
  { code: 'AU046', name: 'Markets Group', businessArea: 'Treasury and Markets', primaryThemeCode: 'T04', additionalThemeCodes: ['T10', 'T06'], ownerName: 'Rajiv Malhotra', description: 'Fixed income, equity, and derivatives trading operations.', volumeDefinition: 'Daily trading volume (₹ Cr)', currentVolume: 25000, previousVolume: 22000 },
  { code: 'AU047', name: 'Proprietary Trading', businessArea: 'Treasury and Markets', primaryThemeCode: 'T04', additionalThemeCodes: ['T10', 'T14'], ownerName: 'Anil Kapoor', description: 'Proprietary trading desk managing the bank\'s own investment portfolio.', volumeDefinition: 'Proprietary book size (₹ Cr)', currentVolume: 45000, previousVolume: 40000 },
  { code: 'AU048', name: 'Treasury Control', businessArea: 'Treasury and Markets', primaryThemeCode: 'T04', additionalThemeCodes: ['T10', 'T14', 'T18'], ownerName: 'Smita Deshpande', description: 'Treasury middle office, P&L reporting, limit monitoring, and regulatory compliance.', volumeDefinition: 'Number of treasury transactions per day', currentVolume: 8500, previousVolume: 7800 },
  { code: 'AU049', name: 'Foreign Exchange Desk', businessArea: 'Treasury and Markets', primaryThemeCode: 'T06', additionalThemeCodes: ['T04', 'T10'], ownerName: 'Gaurav Tandon', description: 'Forex trading, currency derivatives, and cross-currency operations.', volumeDefinition: 'Daily forex turnover (USD Mn)', currentVolume: 2500, previousVolume: 2200 },
  { code: 'AU050', name: 'ALM and Liquidity', businessArea: 'Treasury and Markets', primaryThemeCode: 'T10', additionalThemeCodes: ['T04', 'T14', 'T18'], ownerName: 'Hemant Joshi', description: 'Asset-liability management, liquidity risk management, and funds transfer pricing.', volumeDefinition: 'Balance sheet size (₹ Cr)', currentVolume: 1200000, previousVolume: 1050000 },
  { code: 'AU051', name: 'Derivatives Desk', businessArea: 'Treasury and Markets', primaryThemeCode: 'T04', additionalThemeCodes: ['T10', 'T06'], ownerName: 'Prashant Kulkarni', description: 'Interest rate derivatives, currency options, and structured derivatives products.', volumeDefinition: 'Derivatives notional outstanding (₹ Cr)', currentVolume: 180000, previousVolume: 155000 },
  { code: 'AU052', name: 'Money Market Desk', businessArea: 'Treasury and Markets', primaryThemeCode: 'T04', additionalThemeCodes: ['T10', 'T18'], ownerName: 'Neeraj Gupta', description: 'Call money, repo/reverse repo, commercial paper, and certificate of deposit operations.', volumeDefinition: 'Daily money market volume (₹ Cr)', currentVolume: 35000, previousVolume: 30000 },
  { code: 'AU053', name: 'Investment Portfolio', businessArea: 'Treasury and Markets', primaryThemeCode: 'T04', additionalThemeCodes: ['T14', 'T18'], ownerName: 'Usha Rani', description: 'HTM, AFS, and HFT portfolio management, SLR compliance, and investment accounting.', volumeDefinition: 'Investment portfolio size (₹ Cr)', currentVolume: 350000, previousVolume: 320000 },
  { code: 'AU054', name: 'Treasury Sales', businessArea: 'Treasury and Markets', primaryThemeCode: 'T04', additionalThemeCodes: ['T06', 'T20'], ownerName: 'Vikrant Sharma', description: 'Treasury product sales to corporate and institutional clients.', volumeDefinition: 'Treasury sales revenue (₹ Cr)', currentVolume: 1800, previousVolume: 1500 },
  { code: 'AU055', name: 'Treasury Operations', businessArea: 'Treasury and Markets', primaryThemeCode: 'T04', additionalThemeCodes: ['T05', 'T14'], ownerName: 'Jyoti Prakash', description: 'Treasury back office operations, settlement, confirmation, and reconciliation.', volumeDefinition: 'Number of settlements per day', currentVolume: 4500, previousVolume: 4000 },
  { code: 'AU056', name: 'Equity Trading', businessArea: 'Treasury and Markets', primaryThemeCode: 'T04', additionalThemeCodes: ['T10', 'T14'], ownerName: 'Rahul Dravid', description: 'Equity trading desk managing listed equity investments and equity derivatives.', volumeDefinition: 'Equity portfolio value (₹ Cr)', currentVolume: 15000, previousVolume: 12000 },
  { code: 'AU057', name: 'Commodities Desk', businessArea: 'Treasury and Markets', primaryThemeCode: 'T04', additionalThemeCodes: ['T06', 'T10'], ownerName: 'Ashwin Kumar', description: 'Commodity derivatives trading and hedging operations.', volumeDefinition: 'Commodity derivatives notional (₹ Cr)', currentVolume: 8000, previousVolume: 6500 },
  { code: 'AU058', name: 'Treasury Risk Management', businessArea: 'Treasury and Markets', primaryThemeCode: 'T10', additionalThemeCodes: ['T04', 'T14'], ownerName: 'Meghna Patel', description: 'Market risk measurement, VaR computation, stress testing, and limit monitoring for treasury.', volumeDefinition: 'Number of risk reports generated per day', currentVolume: 120, previousVolume: 100 },
  { code: 'AU059', name: 'Collateral Management', businessArea: 'Treasury and Markets', primaryThemeCode: 'T04', additionalThemeCodes: ['T10', 'T05'], ownerName: 'Tarun Bose', description: 'Collateral management for derivatives, repo transactions, and margin requirements.', volumeDefinition: 'Collateral under management (₹ Cr)', currentVolume: 95000, previousVolume: 85000 },
  { code: 'AU060', name: 'Treasury Technology', businessArea: 'Treasury and Markets', primaryThemeCode: 'T11', additionalThemeCodes: ['T04', 'T13'], ownerName: 'Saurabh Jain', description: 'Treasury management systems, trading platforms, and technology infrastructure.', volumeDefinition: 'Number of treasury systems managed', currentVolume: 18, previousVolume: 15 },
];

// ── Support Functions (~29 AUs) ───────────────────────────────────────────
const SUPPORT_AUS: AUDefinition[] = [
  { code: 'AU061', name: 'Business Technology', businessArea: 'Support Functions', primaryThemeCode: 'T11', additionalThemeCodes: ['T13', 'T12'], ownerName: 'Sandeep Bhatia', description: 'Core banking systems, application development, and technology infrastructure management.', volumeDefinition: 'Number of applications managed', currentVolume: 280, previousVolume: 250 },
  { code: 'AU062', name: 'Compliance Group', businessArea: 'Support Functions', primaryThemeCode: 'T16', additionalThemeCodes: ['T01', 'T18', 'T09'], ownerName: 'Anand Krishnamurthy', description: 'Regulatory compliance monitoring, advisory, and compliance risk management.', volumeDefinition: 'Number of compliance reviews per quarter', currentVolume: 450, previousVolume: 400 },
  { code: 'AU063', name: 'Internal Audit', businessArea: 'Support Functions', primaryThemeCode: 'T16', additionalThemeCodes: ['T15', 'T09'], ownerName: 'Vijay Raghavan', description: 'Internal audit function covering all business lines and support functions.', volumeDefinition: 'Number of audit engagements per year', currentVolume: 180, previousVolume: 165 },
  { code: 'AU064', name: 'HRMG', businessArea: 'Support Functions', primaryThemeCode: 'T17', additionalThemeCodes: ['T09', 'T21'], ownerName: 'Shobha Nair', description: 'Human resource management including recruitment, training, compensation, and employee relations.', volumeDefinition: 'Total employee headcount', currentVolume: 85000, previousVolume: 82000 },
  { code: 'AU065', name: 'Legal Department', businessArea: 'Support Functions', primaryThemeCode: 'T09', additionalThemeCodes: ['T03', 'T08'], ownerName: 'Advocate Rajan', description: 'Legal advisory, litigation management, and regulatory legal compliance.', volumeDefinition: 'Number of active legal cases', currentVolume: 2500, previousVolume: 2200 },
  { code: 'AU066', name: 'Finance and Accounts', businessArea: 'Support Functions', primaryThemeCode: 'T14', additionalThemeCodes: ['T18', 'T09'], ownerName: 'CA Mohan Das', description: 'Financial reporting, Ind AS compliance, tax management, and regulatory financial returns.', volumeDefinition: 'Number of financial reports per quarter', currentVolume: 85, previousVolume: 80 },
  { code: 'AU067', name: 'Risk Management Group', businessArea: 'Support Functions', primaryThemeCode: 'T10', additionalThemeCodes: ['T14', 'T09'], ownerName: 'Dr. Srinivas Rao', description: 'Enterprise risk management, ICAAP, stress testing, and risk appetite framework.', volumeDefinition: 'Number of risk assessments per quarter', currentVolume: 320, previousVolume: 290 },
  { code: 'AU068', name: 'Information Security', businessArea: 'Support Functions', primaryThemeCode: 'T11', additionalThemeCodes: ['T21', 'T13'], ownerName: 'CISO Ravi Kumar', description: 'Cyber security operations, vulnerability management, incident response, and security governance.', volumeDefinition: 'Number of security incidents per month', currentVolume: 45, previousVolume: 52 },
  { code: 'AU069', name: 'Operations and Services', businessArea: 'Support Functions', primaryThemeCode: 'T05', additionalThemeCodes: ['T13', 'T12'], ownerName: 'Sudhir Pandey', description: 'Centralized operations including clearing, settlement, and back-office processing.', volumeDefinition: 'Monthly operations transactions', currentVolume: 15000000, previousVolume: 13500000 },
  { code: 'AU070', name: 'Fraud Risk Management', businessArea: 'Support Functions', primaryThemeCode: 'T15', additionalThemeCodes: ['T11', 'T16'], ownerName: 'Inspector Sharma', description: 'Fraud detection, investigation, reporting, and preventive controls management.', volumeDefinition: 'Number of fraud alerts per month', currentVolume: 12000, previousVolume: 9500 },
  { code: 'AU071', name: 'Vigilance Department', businessArea: 'Support Functions', primaryThemeCode: 'T15', additionalThemeCodes: ['T17', 'T09'], ownerName: 'CVO Prasad', description: 'Vigilance investigations, preventive vigilance, and CVC compliance.', volumeDefinition: 'Number of vigilance cases per year', currentVolume: 85, previousVolume: 78 },
  { code: 'AU072', name: 'Company Secretary', businessArea: 'Support Functions', primaryThemeCode: 'T09', additionalThemeCodes: ['T14', 'T18'], ownerName: 'CS Priya Mehta', description: 'Board secretariat, regulatory filings, corporate governance compliance, and shareholder services.', volumeDefinition: 'Number of board/committee meetings per year', currentVolume: 48, previousVolume: 45 },
  { code: 'AU073', name: 'Premises and Infrastructure', businessArea: 'Support Functions', primaryThemeCode: 'T13', additionalThemeCodes: ['T12', 'T17'], ownerName: 'Rajendra Prasad', description: 'Premises management, facility services, and physical infrastructure maintenance.', volumeDefinition: 'Number of premises managed', currentVolume: 5200, previousVolume: 5000 },
  { code: 'AU074', name: 'Procurement', businessArea: 'Support Functions', primaryThemeCode: 'T12', additionalThemeCodes: ['T09', 'T15'], ownerName: 'Ashish Gupta', description: 'Vendor management, procurement operations, and contract management.', volumeDefinition: 'Annual procurement spend (₹ Cr)', currentVolume: 3500, previousVolume: 3200 },
  { code: 'AU075', name: 'Data Governance', businessArea: 'Support Functions', primaryThemeCode: 'T21', additionalThemeCodes: ['T11', 'T14'], ownerName: 'CDO Anita Rao', description: 'Data quality management, data governance framework, and data privacy compliance.', volumeDefinition: 'Number of data domains governed', currentVolume: 35, previousVolume: 28 },
  { code: 'AU076', name: 'Regulatory Affairs', businessArea: 'Support Functions', primaryThemeCode: 'T18', additionalThemeCodes: ['T16', 'T09'], ownerName: 'Deepak Sharma', description: 'Regulatory relationship management, inspection coordination, and regulatory change management.', volumeDefinition: 'Number of regulatory returns per quarter', currentVolume: 120, previousVolume: 115 },
  { code: 'AU077', name: 'Credit Administration', businessArea: 'Support Functions', primaryThemeCode: 'T03', additionalThemeCodes: ['T10', 'T14'], ownerName: 'Mohan Lal', description: 'Credit documentation, limit management, covenant monitoring, and credit MIS.', volumeDefinition: 'Number of credit facilities managed', currentVolume: 25000, previousVolume: 22000 },
  { code: 'AU078', name: 'Treasury Middle Office', businessArea: 'Support Functions', primaryThemeCode: 'T04', additionalThemeCodes: ['T10', 'T14'], ownerName: 'Kavitha Raman', description: 'Independent valuation, P&L verification, and treasury risk reporting.', volumeDefinition: 'Number of valuations per day', currentVolume: 2500, previousVolume: 2200 },
  { code: 'AU079', name: 'Anti-Money Laundering Cell', businessArea: 'Support Functions', primaryThemeCode: 'T01', additionalThemeCodes: ['T15', 'T18'], ownerName: 'MLRO Suresh', description: 'AML/CFT compliance, STR filing, transaction monitoring, and sanctions screening.', volumeDefinition: 'Number of STRs filed per quarter', currentVolume: 850, previousVolume: 720 },
  { code: 'AU080', name: 'Customer Grievance Cell', businessArea: 'Support Functions', primaryThemeCode: 'T08', additionalThemeCodes: ['T20', 'T18'], ownerName: 'Ombudsman Liaison', description: 'Customer complaint management, ombudsman coordination, and grievance resolution tracking.', volumeDefinition: 'Number of complaints per month', currentVolume: 15000, previousVolume: 13500 },
  { code: 'AU081', name: 'ICOFR Team', businessArea: 'Support Functions', primaryThemeCode: 'T14', additionalThemeCodes: ['T16', 'T10'], ownerName: 'CA Ramesh Iyer', description: 'Internal controls over financial reporting, SOX-equivalent compliance, and control testing.', volumeDefinition: 'Number of ICOFR controls tested per year', currentVolume: 450, previousVolume: 420 },
  { code: 'AU082', name: 'Business Continuity', businessArea: 'Support Functions', primaryThemeCode: 'T13', additionalThemeCodes: ['T11', 'T10'], ownerName: 'BCM Head Rajan', description: 'Business continuity planning, disaster recovery, and crisis management.', volumeDefinition: 'Number of BCP tests per year', currentVolume: 24, previousVolume: 20 },
  { code: 'AU083', name: 'Outsourcing Management', businessArea: 'Support Functions', primaryThemeCode: 'T12', additionalThemeCodes: ['T10', 'T11'], ownerName: 'Vendor Head Priya', description: 'Outsourcing governance, vendor risk assessment, and SLA monitoring.', volumeDefinition: 'Number of outsourced activities', currentVolume: 145, previousVolume: 130 },
  { code: 'AU084', name: 'Training Academy', businessArea: 'Support Functions', primaryThemeCode: 'T17', additionalThemeCodes: ['T16', 'T09'], ownerName: 'Principal Sharma', description: 'Employee training, certification programs, and learning management.', volumeDefinition: 'Number of training programs per year', currentVolume: 350, previousVolume: 310 },
  { code: 'AU085', name: 'Strategic Planning', businessArea: 'Support Functions', primaryThemeCode: 'T09', additionalThemeCodes: ['T10', 'T14'], ownerName: 'Strategy Head Kapil', description: 'Corporate strategy, business planning, and performance management.', volumeDefinition: 'Number of strategic initiatives', currentVolume: 28, previousVolume: 25 },
  { code: 'AU086', name: 'Investor Relations', businessArea: 'Support Functions', primaryThemeCode: 'T14', additionalThemeCodes: ['T09', 'T18'], ownerName: 'IR Head Neeta', description: 'Investor communication, analyst relations, and shareholder engagement.', volumeDefinition: 'Number of investor interactions per quarter', currentVolume: 120, previousVolume: 105 },
  { code: 'AU087', name: 'Corporate Communications', businessArea: 'Support Functions', primaryThemeCode: 'T09', additionalThemeCodes: ['T20', 'T08'], ownerName: 'PR Head Arun', description: 'Media relations, brand management, and corporate social responsibility.', volumeDefinition: 'Number of media interactions per month', currentVolume: 85, previousVolume: 75 },
  { code: 'AU088', name: 'Digital Transformation Office', businessArea: 'Support Functions', primaryThemeCode: 'T11', additionalThemeCodes: ['T19', 'T13'], ownerName: 'CTO Vikram', description: 'Digital strategy execution, innovation lab, and emerging technology adoption.', volumeDefinition: 'Number of digital initiatives', currentVolume: 42, previousVolume: 35 },
  { code: 'AU089', name: 'Priority Sector Lending Cell', businessArea: 'Support Functions', primaryThemeCode: 'T03', additionalThemeCodes: ['T18', 'T20'], ownerName: 'PSL Head Ganesh', description: 'Priority sector lending compliance, target monitoring, and PSLC management.', volumeDefinition: 'PSL achievement percentage', currentVolume: 42, previousVolume: 40 },
];

const ALL_AUS = [...RETAIL_AUS, ...CORPORATE_AUS, ...TREASURY_AUS, ...SUPPORT_AUS];

// ── System complexity data for ~50+ AUs ───────────────────────────────────
interface SystemDef {
  auCode: string;
  systemName: string;
  interfaceCount: number;
  tierCategory: string;
  changeRequests: number;
}

function scoreInterfaces(count: number): number {
  if (count <= 5) return 5;
  if (count <= 10) return 10;
  if (count <= 20) return 15;
  if (count <= 35) return 20;
  return 25;
}

function scoreTier(tier: string): number {
  switch (tier) {
    case 'Tier 1': return 25;
    case 'Tier 2': return 20;
    case 'Tier 3': return 10;
    case 'Tier 4': return 5;
    default: return 10;
  }
}

function scoreChangeRequests(cr: number): number {
  if (cr <= 5) return 5;
  if (cr <= 15) return 10;
  if (cr <= 30) return 15;
  if (cr <= 50) return 20;
  return 25;
}

function roundToNext5(val: number): number {
  return Math.ceil(val / 5) * 5;
}

const SYSTEM_DEFS: SystemDef[] = [
  // Retail Banking systems
  { auCode: 'AU001', systemName: 'Retail Lending System', interfaceCount: 25, tierCategory: 'Tier 1', changeRequests: 45 },
  { auCode: 'AU002', systemName: 'Core Banking System', interfaceCount: 40, tierCategory: 'Tier 1', changeRequests: 60 },
  { auCode: 'AU003', systemName: 'Card Management System', interfaceCount: 30, tierCategory: 'Tier 1', changeRequests: 55 },
  { auCode: 'AU004', systemName: 'Digital Banking Platform', interfaceCount: 35, tierCategory: 'Tier 1', changeRequests: 70 },
  { auCode: 'AU005', systemName: 'Deposit Management System', interfaceCount: 20, tierCategory: 'Tier 1', changeRequests: 35 },
  { auCode: 'AU006', systemName: 'Account Operations System', interfaceCount: 18, tierCategory: 'Tier 2', changeRequests: 28 },
  { auCode: 'AU007', systemName: 'Home Loan Origination System', interfaceCount: 15, tierCategory: 'Tier 2', changeRequests: 25 },
  { auCode: 'AU008', systemName: 'Personal Loan Platform', interfaceCount: 22, tierCategory: 'Tier 2', changeRequests: 40 },
  { auCode: 'AU012', systemName: 'NRI Banking Platform', interfaceCount: 18, tierCategory: 'Tier 2', changeRequests: 20 },
  { auCode: 'AU014', systemName: 'Credit Scoring Engine', interfaceCount: 28, tierCategory: 'Tier 1', changeRequests: 35 },
  { auCode: 'AU016', systemName: 'Payment Gateway', interfaceCount: 38, tierCategory: 'Tier 1', changeRequests: 65 },
  { auCode: 'AU020', systemName: 'CRM System', interfaceCount: 22, tierCategory: 'Tier 2', changeRequests: 30 },
  { auCode: 'AU021', systemName: 'ATM Switch', interfaceCount: 15, tierCategory: 'Tier 1', changeRequests: 20 },
  { auCode: 'AU024', systemName: 'Risk Analytics Platform', interfaceCount: 20, tierCategory: 'Tier 2', changeRequests: 42 },
  // Corporate Banking systems
  { auCode: 'AU026', systemName: 'Corporate Lending System', interfaceCount: 22, tierCategory: 'Tier 1', changeRequests: 30 },
  { auCode: 'AU027', systemName: 'Mid Corporate Platform', interfaceCount: 18, tierCategory: 'Tier 2', changeRequests: 25 },
  { auCode: 'AU028', systemName: 'Trade Finance System', interfaceCount: 28, tierCategory: 'Tier 1', changeRequests: 48 },
  { auCode: 'AU031', systemName: 'Cash Management System', interfaceCount: 32, tierCategory: 'Tier 1', changeRequests: 40 },
  { auCode: 'AU032', systemName: 'SCF Platform', interfaceCount: 20, tierCategory: 'Tier 2', changeRequests: 35 },
  { auCode: 'AU033', systemName: 'SME Lending Platform', interfaceCount: 16, tierCategory: 'Tier 2', changeRequests: 28 },
  { auCode: 'AU038', systemName: 'Government Banking System', interfaceCount: 14, tierCategory: 'Tier 2', changeRequests: 15 },
  { auCode: 'AU039', systemName: 'SWIFT Interface', interfaceCount: 12, tierCategory: 'Tier 1', changeRequests: 18 },
  // Treasury systems
  { auCode: 'AU046', systemName: 'Trading Platform', interfaceCount: 30, tierCategory: 'Tier 1', changeRequests: 50 },
  { auCode: 'AU047', systemName: 'Proprietary Trading System', interfaceCount: 25, tierCategory: 'Tier 1', changeRequests: 45 },
  { auCode: 'AU048', systemName: 'Treasury MIS', interfaceCount: 22, tierCategory: 'Tier 2', changeRequests: 30 },
  { auCode: 'AU049', systemName: 'Forex Trading Platform', interfaceCount: 20, tierCategory: 'Tier 1', changeRequests: 38 },
  { auCode: 'AU050', systemName: 'ALM System', interfaceCount: 18, tierCategory: 'Tier 1', changeRequests: 25 },
  { auCode: 'AU051', systemName: 'Derivatives System', interfaceCount: 24, tierCategory: 'Tier 1', changeRequests: 42 },
  { auCode: 'AU052', systemName: 'Money Market System', interfaceCount: 15, tierCategory: 'Tier 2', changeRequests: 20 },
  { auCode: 'AU053', systemName: 'Investment Portfolio System', interfaceCount: 18, tierCategory: 'Tier 2', changeRequests: 22 },
  { auCode: 'AU055', systemName: 'Treasury Back Office', interfaceCount: 20, tierCategory: 'Tier 2', changeRequests: 28 },
  { auCode: 'AU058', systemName: 'Market Risk System', interfaceCount: 22, tierCategory: 'Tier 1', changeRequests: 32 },
  { auCode: 'AU060', systemName: 'Treasury Tech Stack', interfaceCount: 28, tierCategory: 'Tier 1', changeRequests: 55 },
  // Support Functions systems
  { auCode: 'AU061', systemName: 'Core Banking Infrastructure', interfaceCount: 45, tierCategory: 'Tier 1', changeRequests: 80 },
  { auCode: 'AU062', systemName: 'Compliance Management System', interfaceCount: 15, tierCategory: 'Tier 2', changeRequests: 22 },
  { auCode: 'AU063', systemName: 'Audit Management System', interfaceCount: 12, tierCategory: 'Tier 3', changeRequests: 15 },
  { auCode: 'AU064', systemName: 'HRMS', interfaceCount: 18, tierCategory: 'Tier 2', changeRequests: 25 },
  { auCode: 'AU066', systemName: 'ERP/Finance System', interfaceCount: 22, tierCategory: 'Tier 1', changeRequests: 30 },
  { auCode: 'AU067', systemName: 'Enterprise Risk Platform', interfaceCount: 25, tierCategory: 'Tier 1', changeRequests: 35 },
  { auCode: 'AU068', systemName: 'SIEM/SOC Platform', interfaceCount: 30, tierCategory: 'Tier 1', changeRequests: 48 },
  { auCode: 'AU069', systemName: 'Operations Processing System', interfaceCount: 35, tierCategory: 'Tier 1', changeRequests: 42 },
  { auCode: 'AU070', systemName: 'Fraud Detection System', interfaceCount: 28, tierCategory: 'Tier 1', changeRequests: 55 },
  { auCode: 'AU075', systemName: 'Data Governance Platform', interfaceCount: 20, tierCategory: 'Tier 2', changeRequests: 30 },
  { auCode: 'AU076', systemName: 'Regulatory Reporting System', interfaceCount: 18, tierCategory: 'Tier 2', changeRequests: 25 },
  { auCode: 'AU079', systemName: 'AML Transaction Monitoring', interfaceCount: 25, tierCategory: 'Tier 1', changeRequests: 40 },
  { auCode: 'AU081', systemName: 'ICOFR Testing Tool', interfaceCount: 12, tierCategory: 'Tier 3', changeRequests: 18 },
  { auCode: 'AU082', systemName: 'BCP/DR System', interfaceCount: 15, tierCategory: 'Tier 2', changeRequests: 12 },
  { auCode: 'AU088', systemName: 'Innovation Platform', interfaceCount: 20, tierCategory: 'Tier 2', changeRequests: 45 },
];

// ── Product complexity parameters ─────────────────────────────────────────
interface ProductComplexityDef {
  auCode: string;
  easeOfUnderstanding: number;
  productVariants: number | null;
  regulatoryGuidelines: number;
  complexityOfGuidelines: number;
  supervisoryFocus: number;
}

function computeProductComplexity(def: ProductComplexityDef, auType: string): { rawScore: number; category: string } {
  const factors = auType === 'Business Group'
    ? [def.easeOfUnderstanding, def.productVariants ?? 1, def.regulatoryGuidelines, def.complexityOfGuidelines, def.supervisoryFocus]
    : [def.easeOfUnderstanding, def.regulatoryGuidelines, def.complexityOfGuidelines, def.supervisoryFocus];
  const rawScore = factors.reduce((a, b) => a * b, 1);

  // Req 8.4/8.5: Business Groups: ≤243 Low, 244-2187 Medium, >2188 High
  // Ops/Support: ≤81 Low, 82-729 Medium, >729 High
  if (auType === 'Business Group') {
    if (rawScore > 2187) return { rawScore, category: 'High' };
    if (rawScore >= 244) return { rawScore, category: 'Medium' };
    return { rawScore, category: 'Low' };
  } else {
    if (rawScore > 729) return { rawScore, category: 'High' };
    if (rawScore >= 82) return { rawScore, category: 'Medium' };
    return { rawScore, category: 'Low' };
  }
}

function getAuType(businessArea: string): string {
  return businessArea === 'Support Functions' ? 'Operations/Support Group' : 'Business Group';
}

// Generate product complexity for all AUs with realistic values
function generateProductComplexityDefs(): ProductComplexityDef[] {
  const validScores = [1, 3, 9];
  return ALL_AUS.map((au) => {
    const isSupport = au.businessArea === 'Support Functions';
    // Req 8.2: Each parameter scored 1, 3, or 9
    const base = {
      auCode: au.code,
      easeOfUnderstanding: 3,
      productVariants: isSupport ? null : 3,
      regulatoryGuidelines: 3,
      complexityOfGuidelines: 3,
      supervisoryFocus: 3,
    };

    // Vary based on AU characteristics
    const highComplexityCodes = ['AU003', 'AU004', 'AU028', 'AU046', 'AU047', 'AU049', 'AU051', 'AU061', 'AU068', 'AU070'];
    const lowComplexityCodes = ['AU010', 'AU017', 'AU073', 'AU084', 'AU085', 'AU087'];

    if (highComplexityCodes.includes(au.code)) {
      base.easeOfUnderstanding = 9;
      base.productVariants = isSupport ? null : 9;
      base.regulatoryGuidelines = 9;
      base.complexityOfGuidelines = 9;
      base.supervisoryFocus = 9;
    } else if (lowComplexityCodes.includes(au.code)) {
      base.easeOfUnderstanding = 1;
      base.productVariants = isSupport ? null : 1;
      base.regulatoryGuidelines = 1;
      base.complexityOfGuidelines = 1;
      base.supervisoryFocus = 1;
    } else {
      // Deterministic variation based on AU code number using valid scores
      const num = parseInt(au.code.replace('AU', ''), 10);
      base.easeOfUnderstanding = validScores[num % 3];
      base.productVariants = isSupport ? null : validScores[(num + 1) % 3];
      base.regulatoryGuidelines = validScores[(num + 2) % 3];
      base.complexityOfGuidelines = validScores[(num + 1) % 3];
      base.supervisoryFocus = validScores[num % 3];
    }

    return base;
  });
}

export async function seedAssessmentUnits(
  prisma: PrismaClient,
  themes: Theme[],
): Promise<AssessmentUnit[]> {
  const themeMap = new Map(themes.map((t) => [t.code, t]));
  const results: AssessmentUnit[] = [];

  // 1. Create all AUs
  for (const auDef of ALL_AUS) {
    const primaryTheme = themeMap.get(auDef.primaryThemeCode);
    if (!primaryTheme) throw new Error(`Theme ${auDef.primaryThemeCode} not found for AU ${auDef.code}`);

    const au = await prisma.assessmentUnit.upsert({
      where: { code: auDef.code },
      update: {
        name: auDef.name,
        businessArea: auDef.businessArea,
        themeId: primaryTheme.id,
        ownerName: auDef.ownerName,
        description: auDef.description,
        isActive: true,
      },
      create: {
        code: auDef.code,
        name: auDef.name,
        businessArea: auDef.businessArea,
        themeId: primaryTheme.id,
        ownerName: auDef.ownerName,
        description: auDef.description,
        isActive: true,
      },
    });
    results.push(au);
  }

  console.log(`  ✓ Seeded ${results.length} assessment units`);

  // Build lookup: code → AU record
  const auMap = new Map(results.map((au) => [au.code, au]));

  // 2. Create AUThemeMapping records
  // First clear existing mappings
  await prisma.aUThemeMapping.deleteMany({});
  const mappings: { auId: number; themeId: number }[] = [];
  for (const auDef of ALL_AUS) {
    const au = auMap.get(auDef.code)!;
    // Primary theme mapping
    const primaryTheme = themeMap.get(auDef.primaryThemeCode)!;
    mappings.push({ auId: au.id, themeId: primaryTheme.id });
    // Additional theme mappings
    for (const tc of auDef.additionalThemeCodes) {
      const theme = themeMap.get(tc);
      if (theme) {
        mappings.push({ auId: au.id, themeId: theme.id });
      }
    }
  }
  await prisma.aUThemeMapping.createMany({ data: mappings });
  console.log(`  ✓ Seeded ${mappings.length} AU-theme mappings`);

  // 3. Create AUVolumeDefinition records
  for (const auDef of ALL_AUS) {
    const au = auMap.get(auDef.code)!;
    const gp = growthPct(auDef.currentVolume, auDef.previousVolume);
    await prisma.aUVolumeDefinition.upsert({
      where: { auId: au.id },
      update: {
        volumeDefinition: auDef.volumeDefinition,
        currentVolume: auDef.currentVolume,
        previousVolume: auDef.previousVolume,
        growthPercent: gp,
      },
      create: {
        auId: au.id,
        volumeDefinition: auDef.volumeDefinition,
        currentVolume: auDef.currentVolume,
        previousVolume: auDef.previousVolume,
        growthPercent: gp,
      },
    });
  }
  console.log(`  ✓ Seeded ${ALL_AUS.length} AU volume definitions`);

  // 4. Create AUSystemComplexity records
  // Clear existing
  await prisma.aUSystemComplexity.deleteMany({});
  for (const sys of SYSTEM_DEFS) {
    const au = auMap.get(sys.auCode);
    if (!au) continue;
    const iScore = scoreInterfaces(sys.interfaceCount);
    const tScore = scoreTier(sys.tierCategory);
    const cScore = scoreChangeRequests(sys.changeRequests);
    // Weighted average: interfaces 30%, tier 40%, change requests 30%
    const wAvg = iScore * 0.3 + tScore * 0.4 + cScore * 0.3;
    const finalScore = roundToNext5(wAvg);

    await prisma.aUSystemComplexity.create({
      data: {
        auId: au.id,
        systemName: sys.systemName,
        interfaceCount: sys.interfaceCount,
        tierCategory: sys.tierCategory,
        changeRequests: sys.changeRequests,
        interfaceScore: iScore,
        tierScore: tScore,
        changeScore: cScore,
        weightedAvg: Math.round(wAvg * 100) / 100,
        finalScore,
      },
    });
  }
  console.log(`  ✓ Seeded ${SYSTEM_DEFS.length} AU system complexity records`);

  // 5. Create AUProductComplexity records
  const pcDefs = generateProductComplexityDefs();
  for (const pcDef of pcDefs) {
    const au = auMap.get(pcDef.auCode);
    if (!au) continue;
    const auType = getAuType(ALL_AUS.find((a) => a.code === pcDef.auCode)!.businessArea);
    const { rawScore, category } = computeProductComplexity(pcDef, auType);

    await prisma.aUProductComplexity.upsert({
      where: { auId: au.id },
      update: {
        auType,
        easeOfUnderstanding: pcDef.easeOfUnderstanding,
        productVariants: pcDef.productVariants,
        regulatoryGuidelines: pcDef.regulatoryGuidelines,
        complexityOfGuidelines: pcDef.complexityOfGuidelines,
        supervisoryFocus: pcDef.supervisoryFocus,
        rawScore,
        category,
      },
      create: {
        auId: au.id,
        auType,
        easeOfUnderstanding: pcDef.easeOfUnderstanding,
        productVariants: pcDef.productVariants,
        regulatoryGuidelines: pcDef.regulatoryGuidelines,
        complexityOfGuidelines: pcDef.complexityOfGuidelines,
        supervisoryFocus: pcDef.supervisoryFocus,
        rawScore,
        category,
      },
    });
  }
  console.log(`  ✓ Seeded ${pcDefs.length} AU product complexity records`);

  return results;
}
