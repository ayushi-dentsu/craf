import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware factory that enforces role-based access control.
 * Looks up the user's role + resource + action in the RolePermission table
 * and enforces scope restrictions (all, assigned, own).
 */
export function authorize(resource: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        status: 401,
        code: 'AUTH_REQUIRED',
        message: 'Authentication required.',
        details: null,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { role, assignedAuIds } = req.user;

    try {
      const permission = await prisma.rolePermission.findUnique({
        where: {
          role_resource_action: { role, resource, action },
        },
      });

      if (!permission) {
        res.status(403).json({
          status: 403,
          code: 'RBAC_PERMISSION_DENIED',
          message: `Role '${role}' does not have '${action}' permission on '${resource}'.`,
          details: null,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (permission.scope === 'all') {
        next();
        return;
      }

      if (permission.scope === 'assigned') {
        const auId = extractAuId(req);
        if (auId !== null && !assignedAuIds.includes(auId)) {
          res.status(403).json({
            status: 403,
            code: 'RBAC_AU_NOT_ASSIGNED',
            message: `Access denied. AU ${auId} is not in your assigned Assessment Units.`,
            details: { requestedAuId: auId, assignedAuIds },
            timestamp: new Date().toISOString(),
          });
          return;
        }
        next();
        return;
      }

      if (permission.scope === 'own') {
        // Attach scope info for downstream handlers to check entity ownership
        (req as any).rbacScope = 'own';
        (req as any).rbacUserId = req.user.userId;
        next();
        return;
      }

      // Unknown scope — deny by default
      res.status(403).json({
        status: 403,
        code: 'RBAC_UNKNOWN_SCOPE',
        message: 'Permission denied due to unrecognized scope.',
        details: null,
        timestamp: new Date().toISOString(),
      });
    } catch {
      res.status(500).json({
        status: 500,
        code: 'INTERNAL_RBAC_ERROR',
        message: 'An error occurred while checking permissions.',
        details: null,
        timestamp: new Date().toISOString(),
      });
    }
  };
}

/**
 * Extracts the AU ID from the request params, body, or query.
 */
function extractAuId(req: Request): number | null {
  const raw = req.params?.auId ?? req.body?.auId ?? req.query?.auId;
  if (raw === undefined || raw === null) {
    return null;
  }
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? null : parsed;
}

export { extractAuId };
