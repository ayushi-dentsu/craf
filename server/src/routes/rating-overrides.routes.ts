import { Router, type Request, type Response, type NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validateBody, validateQuery } from '../middleware/validation.middleware.js';
import { ValidationError, NotFoundError } from '../middleware/error-handler.middleware.js';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createBodySchema = {
  auId: { type: 'number' as const, required: true, min: 1 },
  periodId: { type: 'number' as const, required: true, min: 1 },
  originalRating: { type: 'string' as const, required: true, min: 1 },
  overriddenRating: { type: 'string' as const, required: true, min: 1 },
  reason: { type: 'string' as const, required: true, min: 1 },
};

const listQuerySchema = {
  auId: { type: 'number' as const, min: 1 },
  periodId: { type: 'number' as const, min: 1 },
};

// Apply auth to all routes
router.use(authenticate);

// POST /api/rating-overrides — create a rating override
router.post(
  '/',
  authorize('overrides', 'write'),
  validateBody(createBodySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { auId, periodId, originalRating, overriddenRating, reason } = req.body;

      if (!reason || reason.trim().length === 0) {
        throw new ValidationError('Reason for override is required and must not be empty.');
      }

      // Verify AU exists
      const au = await prisma.assessmentUnit.findUnique({
        where: { id: auId },
        select: { id: true },
      });
      if (!au) {
        throw new NotFoundError(`Assessment Unit ${auId} not found.`);
      }

      // Verify period exists
      const period = await prisma.assessmentPeriod.findUnique({
        where: { id: periodId },
        select: { id: true },
      });
      if (!period) {
        throw new NotFoundError(`Assessment Period ${periodId} not found.`);
      }

      const officerName = req.user!.username;
      const officerRole = req.user!.role;

      // Create the override record
      const override = await prisma.ratingOverride.create({
        data: {
          auId,
          periodId,
          originalRating,
          overriddenRating,
          reason: reason.trim(),
          officerName,
          officerRole,
        },
      });

      // Trigger downstream recalculation: update ResidualRisk aggregateRating
      await prisma.residualRisk.updateMany({
        where: { auId, periodId },
        data: { aggregateRating: overriddenRating },
      });

      res.status(201).json(override);
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/rating-overrides — list overrides with filters
router.get(
  '/',
  authorize('overrides', 'read'),
  validateQuery(listQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const where: Record<string, unknown> = {};
      if (req.query.auId) where.auId = Number(req.query.auId);
      if (req.query.periodId) where.periodId = Number(req.query.periodId);

      const overrides = await prisma.ratingOverride.findMany({
        where,
        include: {
          au: { select: { id: true, name: true } },
          period: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(overrides);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
