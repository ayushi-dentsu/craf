/**
 * Seed data for role_permissions table.
 * Implements the full RBAC role-permission matrix from the design.
 * Requirements: 31.7
 */
import { PrismaClient } from '@prisma/client';

interface PermissionDef {
  role: string;
  resource: string;
  action: string;
  scope: string;
}

const PERMISSIONS: PermissionDef[] = [
  // GCCO — full access
  { role: 'GCCO', resource: 'dashboard', action: 'read', scope: 'all' },
  { role: 'GCCO', resource: 'assessment-units', action: 'read', scope: 'all' },
  { role: 'GCCO', resource: 'assessment-units', action: 'write', scope: 'all' },
  { role: 'GCCO', resource: 'controls', action: 'read', scope: 'all' },
  { role: 'GCCO', resource: 'controls', action: 'write', scope: 'all' },
  { role: 'GCCO', resource: 'overrides', action: 'read', scope: 'all' },
  { role: 'GCCO', resource: 'overrides', action: 'write', scope: 'all' },
  { role: 'GCCO', resource: 'compliance', action: 'read', scope: 'all' },
  { role: 'GCCO', resource: 'materiality', action: 'read', scope: 'all' },
  { role: 'GCCO', resource: 'materiality', action: 'write', scope: 'all' },

  // GCO — read all, write controls
  { role: 'GCO', resource: 'dashboard', action: 'read', scope: 'all' },
  { role: 'GCO', resource: 'assessment-units', action: 'read', scope: 'all' },
  { role: 'GCO', resource: 'controls', action: 'read', scope: 'all' },
  { role: 'GCO', resource: 'controls', action: 'write', scope: 'all' },
  { role: 'GCO', resource: 'overrides', action: 'read', scope: 'all' },
  { role: 'GCO', resource: 'compliance', action: 'read', scope: 'all' },
  { role: 'GCO', resource: 'materiality', action: 'read', scope: 'all' },

  // HeadCompliance — read all, write overrides + materiality
  { role: 'HeadCompliance', resource: 'dashboard', action: 'read', scope: 'all' },
  { role: 'HeadCompliance', resource: 'assessment-units', action: 'read', scope: 'all' },
  { role: 'HeadCompliance', resource: 'controls', action: 'read', scope: 'all' },
  { role: 'HeadCompliance', resource: 'overrides', action: 'read', scope: 'all' },
  { role: 'HeadCompliance', resource: 'overrides', action: 'write', scope: 'all' },
  { role: 'HeadCompliance', resource: 'compliance', action: 'read', scope: 'all' },
  { role: 'HeadCompliance', resource: 'materiality', action: 'read', scope: 'all' },
  { role: 'HeadCompliance', resource: 'materiality', action: 'write', scope: 'all' },

  // HeadCPR — read only
  { role: 'HeadCPR', resource: 'dashboard', action: 'read', scope: 'all' },
  { role: 'HeadCPR', resource: 'assessment-units', action: 'read', scope: 'all' },
  { role: 'HeadCPR', resource: 'controls', action: 'read', scope: 'all' },
  { role: 'HeadCPR', resource: 'compliance', action: 'read', scope: 'all' },
  { role: 'HeadCPR', resource: 'materiality', action: 'read', scope: 'all' },

  // CGAdvisory — read all, write controls
  { role: 'CGAdvisory', resource: 'dashboard', action: 'read', scope: 'all' },
  { role: 'CGAdvisory', resource: 'assessment-units', action: 'read', scope: 'all' },
  { role: 'CGAdvisory', resource: 'controls', action: 'read', scope: 'all' },
  { role: 'CGAdvisory', resource: 'controls', action: 'write', scope: 'all' },
  { role: 'CGAdvisory', resource: 'compliance', action: 'read', scope: 'all' },

  // AUHead — dashboard read, own/assigned AUs and controls
  { role: 'AUHead', resource: 'dashboard', action: 'read', scope: 'all' },
  { role: 'AUHead', resource: 'assessment-units', action: 'read', scope: 'assigned' },
  { role: 'AUHead', resource: 'assessment-units', action: 'write', scope: 'assigned' },
  { role: 'AUHead', resource: 'controls', action: 'read', scope: 'assigned' },
  { role: 'AUHead', resource: 'controls', action: 'write', scope: 'assigned' },

  // ComplianceMonitoring — read all
  { role: 'ComplianceMonitoring', resource: 'dashboard', action: 'read', scope: 'all' },
  { role: 'ComplianceMonitoring', resource: 'assessment-units', action: 'read', scope: 'all' },
  { role: 'ComplianceMonitoring', resource: 'controls', action: 'read', scope: 'all' },
  { role: 'ComplianceMonitoring', resource: 'compliance', action: 'read', scope: 'all' },
];

export async function seedRolePermissions(prisma: PrismaClient): Promise<void> {
  // Clear existing permissions
  await prisma.rolePermission.deleteMany({});

  for (const perm of PERMISSIONS) {
    await prisma.rolePermission.create({
      data: {
        role: perm.role,
        resource: perm.resource,
        action: perm.action,
        scope: perm.scope,
      },
    });
  }

  console.log(`  ✓ Seeded ${PERMISSIONS.length} role permissions`);
}
