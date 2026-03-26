/**
 * Response Time Logging Middleware
 *
 * Logs request duration for all API endpoints.
 * Warns when any endpoint exceeds the 500ms threshold (Requirement 28.5).
 *
 * Requirements: 28.4, 28.5
 */

import type { Request, Response, NextFunction } from 'express';

const API_RESPONSE_THRESHOLD_MS = 500;

export function responseTimeLogger(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    const rounded = Math.round(durationMs * 100) / 100;

    const method = req.method;
    const url = req.originalUrl;
    const status = res.statusCode;

    if (rounded > API_RESPONSE_THRESHOLD_MS) {
      console.warn(
        `[SLOW] ${method} ${url} ${status} — ${rounded}ms (exceeds ${API_RESPONSE_THRESHOLD_MS}ms threshold)`,
      );
    } else {
      console.log(`[API] ${method} ${url} ${status} — ${rounded}ms`);
    }
  });

  next();
}
