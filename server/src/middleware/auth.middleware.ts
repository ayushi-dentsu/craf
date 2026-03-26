import { Request, Response, NextFunction } from 'express';
import { verifyToken, type JwtPayload } from '../services/auth.service.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      status: 401,
      code: 'AUTH_MISSING_TOKEN',
      message: 'Authentication required. Provide a Bearer token in the Authorization header.',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({
      status: 401,
      code: 'AUTH_INVALID_TOKEN',
      message: 'Invalid or expired token.',
      timestamp: new Date().toISOString(),
    });
  }
}
