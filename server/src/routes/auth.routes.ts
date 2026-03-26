import { Router, type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateToken, verifyPassword } from '../services/auth.service.js';

const router = Router();
const prisma = new PrismaClient();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        status: 400,
        code: 'AUTH_MISSING_CREDENTIALS',
        message: 'Username and password are required.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      res.status(401).json({
        status: 401,
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid username or password.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const valid = await verifyPassword(password, user.passwordHash);

    if (!valid) {
      res.status(401).json({
        status: 401,
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid username or password.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      assignedAuIds: user.assignedAuIds,
    });

    res.json({
      token,
      userId: user.id,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    console.error('[AUTH] Login error:', err);
    res.status(500).json({
      status: 500,
      code: 'AUTH_SERVER_ERROR',
      message: 'An internal error occurred during authentication.',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
