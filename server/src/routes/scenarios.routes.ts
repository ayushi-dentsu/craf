/**
 * Scenario Routes
 *
 * GET /api/scenarios — all scenario data
 * GET /api/scenarios/:scenarioId — specific scenario (1, 2, or 3)
 *
 * Requirements: 24.1-24.4, 25.1-25.4, 26.1-26.4
 */

import { Router, type Request, type Response, type NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { ensureScenarioData } from '../services/seed-data/index.js';
import { NotFoundError } from '../middleware/error-handler.middleware.js';

const router = Router();

router.use(authenticate);
router.use(authorize('dashboard', 'read'));

// GET /api/scenarios — all scenario data
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await ensureScenarioData();
    if (!data) {
      throw new NotFoundError('Scenario data not available. Please run seed first.');
    }
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/scenarios/:scenarioId — specific scenario (1, 2, or 3)
router.get('/:scenarioId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await ensureScenarioData();
    if (!data) {
      throw new NotFoundError('Scenario data not available. Please run seed first.');
    }

    const id = req.params.scenarioId;
    if (id === '1') {
      res.json(data.scenario1);
    } else if (id === '2') {
      res.json(data.scenario2);
    } else if (id === '3') {
      res.json(data.scenario3);
    } else {
      throw new NotFoundError(`Scenario ${id} not found. Valid IDs: 1, 2, 3.`);
    }
  } catch (error) {
    next(error);
  }
});

export default router;
