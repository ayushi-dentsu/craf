import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  CalculationError,
  InternalError,
  errorHandler,
  notFoundHandler,
} from './error-handler.middleware.js';

function createMockReqRes(method = 'GET', url = '/test') {
  const req = { method, originalUrl: url } as any;
  const jsonBody: any = {};
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn((body: any) => Object.assign(jsonBody, body)),
  } as any;
  const next = vi.fn();
  return { req, res, next, jsonBody };
}

describe('error-handler.middleware', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  // ── AppError subclass status codes ──

  describe('AppError subclasses', () => {
    it('ValidationError produces 400', () => {
      const err = new ValidationError('bad input', { field: 'name' });
      const { req, res, next, jsonBody } = createMockReqRes();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(jsonBody.status).toBe(400);
      expect(jsonBody.code).toBe('VALIDATION_ERROR');
      expect(jsonBody.message).toBe('bad input');
      expect(jsonBody.timestamp).toBeDefined();
    });

    it('AuthenticationError produces 401', () => {
      const err = new AuthenticationError();
      const { req, res, next, jsonBody } = createMockReqRes();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(jsonBody.code).toBe('AUTH_ERROR');
    });

    it('ForbiddenError produces 403', () => {
      const err = new ForbiddenError('no access');
      const { req, res, next, jsonBody } = createMockReqRes();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(jsonBody.code).toBe('FORBIDDEN');
    });

    it('NotFoundError produces 404', () => {
      const err = new NotFoundError('missing');
      const { req, res, next, jsonBody } = createMockReqRes();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(jsonBody.code).toBe('NOT_FOUND');
    });

    it('CalculationError produces 422', () => {
      const err = new CalculationError('division by zero', { divisor: 0 });
      const { req, res, next, jsonBody } = createMockReqRes();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(jsonBody.code).toBe('CALCULATION_ERROR');
    });

    it('InternalError produces 500', () => {
      const err = new InternalError();
      const { req, res, next, jsonBody } = createMockReqRes();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(jsonBody.code).toBe('INTERNAL_ERROR');
    });
  });

  // ── Structured response format ──

  describe('structured response format', () => {
    it('includes all required fields: status, code, message, details, timestamp', () => {
      const err = new ValidationError('oops', { x: 1 });
      const { req, res, next, jsonBody } = createMockReqRes();

      errorHandler(err, req, res, next);

      expect(jsonBody).toHaveProperty('status');
      expect(jsonBody).toHaveProperty('code');
      expect(jsonBody).toHaveProperty('message');
      expect(jsonBody).toHaveProperty('details');
      expect(jsonBody).toHaveProperty('timestamp');
    });
  });

  // ── Generic errors ──

  describe('generic Error handling', () => {
    it('returns 500 with INTERNAL_ERROR for plain Error', () => {
      const err = new Error('something broke');
      const { req, res, next, jsonBody } = createMockReqRes();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(jsonBody.status).toBe(500);
      expect(jsonBody.code).toBe('INTERNAL_ERROR');
      expect(jsonBody.message).toBe('An internal server error occurred.');
      expect(jsonBody.timestamp).toBeDefined();
    });
  });

  // ── Stack trace visibility ──

  describe('stack trace handling', () => {
    it('includes stack in details in non-production', () => {
      process.env.NODE_ENV = 'development';
      const err = new Error('dev error');
      const { req, res, next, jsonBody } = createMockReqRes();

      errorHandler(err, req, res, next);

      expect(jsonBody.details).toBeDefined();
      expect((jsonBody.details as any).stack).toBeDefined();
    });

    it('hides stack in production for generic errors', () => {
      process.env.NODE_ENV = 'production';
      const err = new Error('prod error');
      const { req, res, next, jsonBody } = createMockReqRes();

      errorHandler(err, req, res, next);

      expect(jsonBody.details).toBeNull();
    });

    it('hides stack in production for AppError', () => {
      process.env.NODE_ENV = 'production';
      const err = new ValidationError('bad', { field: 'x' });
      const { req, res, next, jsonBody } = createMockReqRes();

      errorHandler(err, req, res, next);

      expect(jsonBody.details).toEqual({ field: 'x' });
      // No stack property
      expect((jsonBody.details as any).stack).toBeUndefined();
    });
  });

  // ── notFoundHandler ──

  describe('notFoundHandler', () => {
    it('calls next with a NotFoundError containing method and URL', () => {
      const { req, res, next } = createMockReqRes('POST', '/api/missing');

      notFoundHandler(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(NotFoundError);
      expect(err.status).toBe(404);
      expect(err.message).toContain('POST');
      expect(err.message).toContain('/api/missing');
    });
  });
});
