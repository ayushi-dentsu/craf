/**
 * Seed data for 8 sample users (one per governance role).
 * Requirements: 29.3
 */
import { PrismaClient, AssessmentUnit } from '@prisma/client';
import bcrypt from 'bcryptjs';

const DEFAULT_PASSWORD = 'craf2025';

interface UserDef {
  username: string;
  name: string;
  role: string;
  /** AU name patterns to match for assignedAuIds (only for AUHead role) */
  assignedAuPatterns?: string[];
}

const USERS: UserDef[] = [
  { username: 'gcco', name: 'Group Chief Compliance Officer', role: 'GCCO' },
  { username: 'gco', name: 'Group Compliance Officer', role: 'GCO' },
  { username: 'head_compliance', name: 'Head of Compliance and ICOFR', role: 'HeadCompliance' },
  { username: 'head_cpr', name: 'Head of Compliance Process Re-Engineering', role: 'HeadCPR' },
  { username: 'cg_advisory', name: 'CG Advisory Team Lead', role: 'CGAdvisory' },
  {
    username: 'au_head_tf',
    name: 'Head of Trade Finance',
    role: 'AUHead',
    assignedAuPatterns: ['Trade Finance Operations Group'],
  },
  {
    username: 'au_head_rl',
    name: 'Head of Retail Liabilities',
    role: 'AUHead',
    assignedAuPatterns: ['Liabilities Operations Group', 'Retail Liabilities'],
  },
  { username: 'comp_monitor', name: 'Compliance Monitoring Lead', role: 'ComplianceMonitoring' },
];

export async function seedUsers(
  prisma: PrismaClient,
  assessmentUnits: AssessmentUnit[],
): Promise<void> {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const userDef of USERS) {
    let assignedAuIds: number[] = [];

    if (userDef.assignedAuPatterns && userDef.assignedAuPatterns.length > 0) {
      assignedAuIds = assessmentUnits
        .filter((au) => userDef.assignedAuPatterns!.some((pattern) => au.name === pattern))
        .map((au) => au.id);
    }

    await prisma.user.upsert({
      where: { username: userDef.username },
      update: {
        name: userDef.name,
        role: userDef.role,
        passwordHash,
        assignedAuIds,
      },
      create: {
        username: userDef.username,
        name: userDef.name,
        role: userDef.role,
        passwordHash,
        assignedAuIds,
      },
    });
  }

  console.log(`  ✓ Seeded ${USERS.length} users`);
}
