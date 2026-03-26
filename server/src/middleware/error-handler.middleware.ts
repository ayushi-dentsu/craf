import { Request, Response, NextFunction } from 'express';

// ── Custom Error Classes ──

export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details: unknown;

  constructor(status: number, code: string, message: string, details: unknown = null) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed.', details: unknown = null) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required.', details: unknown = null) {
    super(401, 'AUTH_ERROR', message, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied.', details: unknown = null) {
    super(403, 'FORBIDDEN', message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found.', details: unknown = null) {
    super(404, 'NOT_FOUND', message, details);
  }
}

export class CalculationError extends AppError {
  constructor(message = 'Calculation error.', details: unknown = null) {
    super(422, 'CALCULATION_ERROR', message, details);
  }
}

export class InternalError extends AppError {
  constructor(message = 'An internal server error occurred.', details: unknown = null) {
    super(500, 'INTERNAL_ERROR', message, details);
  }
}

// ── Error Handling Middleware ──

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isProduction = process.env.NODE_ENV === 'production';

  if (err instanceof AppError) {
    const body: Record<string, unknown> = {
      status: err.status,
      code: err.code,
      message: err.message,
      details: err.details,
      timestamp: new Date().toISOString(),
    };
    if (!isProduction && err.stack) {
      body.details = body.details ?? {};
      if (typeof body.details === 'object' && body.details !== null) {
        (body.details as Record<string, unknown>).stack = err.stack;
      } else {
        body.details = { original: body.details, stack: err.stack };
      }
    }
    res.status(err.status).json(body);
    return;
  }

  // Generic / unexpected errors → 500
  const body: Record<string, unknown> = {
    status: 500,
    code: 'INTERNAL_ERROR',
    message: 'An internal server error occurred.',
    details: null,
    timestamp: new Date().toISOString(),
  };
  if (!isProduction && err.stack) {
    body.details = { stack: err.stack };
  }
  res.status(500).json(body);
}

// ── Not Found Handler ──

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
}
