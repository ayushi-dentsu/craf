/**
 * Dashboard Routes
 *
 * GET /api/dashboard/executive — full executive dashboard data
 * GET /api/dashboard/executive/kpis — KPI cards only
 * GET /api/dashboard/executive/heatmap — heatmap with filters
 * GET /api/dashboard/executive/trends — trend charts
 * GET /api/dashboard/rbi-compliance — RBI compliance dashboard
 *
 * Requirements: 28.3
 */

import { Router, type Request, type Response, type NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validateQuery } from '../middleware/validation.middleware.js';
import {
  getExecutiveDashboard,
  getKPIs,
  getHeatmapData,
  getTrendData,
  type DashboardFilters,
} from '../services/dashboard-service/executive.service.js';
import { getComplianceDashboard } from '../services/dashboard-service/compliance.service.js';

const router = Router();

const dashboardQuerySchema = {
  periodId: { type: 'number' as const, min: 1 },
  businessArea: { type: 'string' as const },
  riskRating: { type: 'string' as const },
  themeId: { type: 'number' as const, min: 1 },
};

const periodQuerySchema = {
  periodId: { type: 'number' as const, min: 1 },
};

// Apply auth + RBAC to all dashboard routes
router.use(authenticate);
router.use(authorize('dashboard', 'read'));

// GET /api/dashboard/executive — full executive dashboard data
router.get(
  '/executive',
  validateQuery(dashboardQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters: DashboardFilters = {
        periodId: req.query.periodId ? Number(req.query.periodId) : undefined,
        businessArea: req.query.businessArea as string | undefined,
        riskRating: req.query.riskRating as string | undefined,
        themeId: req.query.themeId ? Number(req.query.themeId) : undefined,
      };
      const data = await getExecutiveDashboard(filters);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/dashboard/executive/kpis — KPI cards only
router.get(
  '/executive/kpis',
  validateQuery(periodQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let periodId = req.query.periodId ? Number(req.query.periodId) : undefined;
      if (!periodId) {
        // Will be resolved inside getKPIs via the executive service
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        const current = await prisma.assessmentPeriod.findFirst({ where: { isCurrent: true } });
        if (!current) {
          res.status(404).json({ status: 404, code: 'NOT_FOUND', message: 'No current assessment period found.', timestamp: new Date().toISOString() });
          return;
        }
        periodId = current.id;
      }
      const kpis = await getKPIs(periodId);
      res.json(kpis);
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/dashboard/executive/heatmap — heatmap with filters
router.get(
  '/executive/heatmap',
  validateQuery(dashboardQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let periodId = req.query.periodId ? Number(req.query.periodId) : undefined;
      if (!periodId) {
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        const current = await prisma.assessmentPeriod.findFirst({ where: { isCurrent: true } });
        if (!current) {
          res.status(404).json({ status: 404, code: 'NOT_FOUND', message: 'No current assessment period found.', timestamp: new Date().toISOString() });
          return;
        }
        periodId = current.id;
      }
      const filters = {
        businessArea: req.query.businessArea as string | undefined,
        riskRating: req.query.riskRating as string | undefined,
        themeId: req.query.themeId ? Number(req.query.themeId) : undefined,
      };
      const heatmap = await getHeatmapData(periodId, filters);
      res.json({ periodId, entries: heatmap });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/dashboard/executive/trends — trend charts
router.get(
  '/executive/trends',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const trends = await getTrendData();
      res.json(trends);
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/dashboard/rbi-compliance — RBI compliance dashboard
router.get(
  '/rbi-compliance',
  validateQuery(periodQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const periodId = req.query.periodId ? Number(req.query.periodId) : undefined;
      const data = await getComplianceDashboard(periodId);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
