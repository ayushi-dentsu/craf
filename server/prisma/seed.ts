/**
 * Prisma seed entry point.
 * Runs all seed data generators in dependency order.
 */
import { PrismaClient } from '@prisma/client';
import { seedThemes } from '../src/services/seed-data/themes.seed.js';
import { seedAssessmentUnits } from '../src/services/seed-data/assessment-units.seed.js';
import { seedObligations } from '../src/services/seed-data/obligations.seed.js';
import { seedControls } from '../src/services/seed-data/controls.seed.js';
import { seedRiskData } from '../src/services/seed-data/risk-data.seed.js';
import { seedUsers } from '../src/services/seed-data/users.seed.js';
import { seedScenarioData } from '../src/services/seed-data/scenario-data.seed.js';
import { seedRolePermissions } from '../src/services/seed-data/role-permissions.seed.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CRAF seed data generation...\n');

  // 1. Themes
  console.log('📋 Seeding themes...');
  const themes = await seedThemes(prisma);

  // 2. Assessment Units (+ volume, system complexity, product complexity, theme mappings)
  console.log('🏢 Seeding assessment units...');
  const assessmentUnits = await seedAssessmentUnits(prisma, themes);

  // 3. Compliance Obligations
  console.log('📜 Seeding compliance obligations...');
  const obligations = await seedObligations(prisma, themes, assessmentUnits);

  // 4. Controls
  console.log('🔒 Seeding controls...');
  const controls = await seedControls(prisma, obligations);

  // 5. Risk Data (inherent risk, CQA, CPA, CER, residual risk, materiality)
  console.log('📊 Seeding risk assessment data...');
  await seedRiskData(prisma, assessmentUnits, controls, obligations);

  // 6. Scenario Data (demo scenario pre-computed data)
  console.log('🎬 Seeding demo scenario data...');
  await seedScenarioData(prisma, assessmentUnits);

  // 7. Users
  console.log('👤 Seeding users...');
  await seedUsers(prisma, assessmentUnits);

  // 8. Role Permissions
  console.log('🔐 Seeding role permissions...');
  await seedRolePermissions(prisma);

  console.log('\n✅ Seed data generation complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
