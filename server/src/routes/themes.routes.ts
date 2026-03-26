import { Router, type Request, type Response, type NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validateParams } from '../middleware/validation.middleware.js';
import { NotFoundError } from '../middleware/error-handler.middleware.js';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const themeIdParamsSchema = {
  themeId: { type: 'number' as const, required: true, min: 1 },
};

// Apply auth + RBAC to all routes
router.use(authenticate);
router.use(authorize('themes', 'read'));

// GET /api/themes — list all themes
router.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const themes = await prisma.theme.findMany({
        orderBy: { name: 'asc' },
      });

      res.json(themes);
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/themes/:themeId/assessment-units — list AUs under a theme
router.get(
  '/:themeId/assessment-units',
  validateParams(themeIdParamsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const themeId = Number(req.params.themeId);

      const theme = await prisma.theme.findUnique({
        where: { id: themeId },
      });

      if (!theme) {
        throw new NotFoundError(`Theme ${themeId} not found.`);
      }

      const assessmentUnits = await prisma.assessmentUnit.findMany({
        where: { themeId },
        include: { theme: { select: { id: true, name: true } } },
        orderBy: { name: 'asc' },
      });

      res.json(assessmentUnits);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
