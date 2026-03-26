/**
 * Seed data for 21 CRAF Themes from Annexure II.
 * Requirements: 1.1, 27.1
 */
import { PrismaClient, Theme } from '@prisma/client';

const THEMES = [
  { code: 'T01', name: 'KYC/AML/CFT', description: 'Know Your Customer, Anti-Money Laundering, and Combating the Financing of Terrorism regulations and compliance requirements.' },
  { code: 'T02', name: 'Deposits and Accounts', description: 'Regulations governing deposit products, savings accounts, current accounts, fixed deposits, and related customer account management.' },
  { code: 'T03', name: 'Lending and Credit', description: 'Regulations covering loan origination, credit appraisal, disbursement, monitoring, NPA classification, and provisioning norms.' },
  { code: 'T04', name: 'Investment and Treasury', description: 'Regulations governing investment portfolio management, treasury operations, SLR/CRR compliance, and market risk management.' },
  { code: 'T05', name: 'Payment and Settlement Systems', description: 'Regulations covering RTGS, NEFT, UPI, card payments, and other payment and settlement system operations.' },
  { code: 'T06', name: 'Foreign Exchange Management', description: 'FEMA regulations, authorized dealer operations, cross-border transactions, and foreign exchange risk management.' },
  { code: 'T07', name: 'Insurance and Pension', description: 'Regulations governing bancassurance, pension fund management, IRDAI compliance, and PFRDA requirements.' },
  { code: 'T08', name: 'Customer Protection and Grievance Redressal', description: 'Customer rights, fair practice code, grievance redressal mechanisms, ombudsman scheme, and customer service standards.' },
  { code: 'T09', name: 'Corporate Governance', description: 'Board composition, committee structures, fit and proper criteria, related party transactions, and governance disclosure requirements.' },
  { code: 'T10', name: 'Risk Management', description: 'Enterprise risk management framework, ICAAP, stress testing, risk appetite, and integrated risk reporting requirements.' },
  { code: 'T11', name: 'Information Technology and Cyber Security', description: 'IT governance, cyber security framework, data center management, business continuity for IT, and technology risk management.' },
  { code: 'T12', name: 'Outsourcing', description: 'Outsourcing policy, vendor risk management, due diligence requirements, and regulatory restrictions on outsourcing activities.' },
  { code: 'T13', name: 'Business Continuity Management', description: 'Business continuity planning, disaster recovery, crisis management, and operational resilience requirements.' },
  { code: 'T14', name: 'Financial Reporting and Disclosure', description: 'Financial statement preparation, Ind AS compliance, regulatory disclosures, Pillar 3 disclosures, and audit requirements.' },
  { code: 'T15', name: 'Fraud Prevention and Management', description: 'Fraud risk management framework, fraud monitoring, reporting to RBI, and preventive controls for fraud mitigation.' },
  { code: 'T16', name: 'Internal Audit and Compliance', description: 'Internal audit framework, compliance function, concurrent audit, statutory audit coordination, and regulatory inspection management.' },
  { code: 'T17', name: 'Human Resource Management', description: 'Compensation policy, employee conduct, whistle-blower mechanism, training requirements, and succession planning.' },
  { code: 'T18', name: 'Regulatory Returns and Reporting', description: 'Statutory returns to RBI, SEBI, and other regulators including DSB, CRILC, and other periodic reporting requirements.' },
  { code: 'T19', name: 'Licensing and Authorization', description: 'Branch licensing, ATM deployment, business correspondent authorization, and new product/service approval requirements.' },
  { code: 'T20', name: 'Market Conduct and Fair Practice', description: 'Fair practice code for lending, mis-selling prevention, transparency in pricing, and responsible banking conduct.' },
  { code: 'T21', name: 'Data Privacy and Protection', description: 'Data protection regulations, customer data privacy, consent management, data localization, and cross-border data transfer requirements.' },
];

export async function seedThemes(prisma: PrismaClient): Promise<Theme[]> {
  const results: Theme[] = [];

  for (const theme of THEMES) {
    const record = await prisma.theme.upsert({
      where: { code: theme.code },
      update: { name: theme.name, description: theme.description },
      create: theme,
    });
    results.push(record);
  }

  console.log(`  ✓ Seeded ${results.length} themes`);
  return results;
}
