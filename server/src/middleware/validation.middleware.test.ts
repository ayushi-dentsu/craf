import { describe, it, expect, vi } from 'vitest';
import { validateBody, validateQuery, validateParams, type ValidationSchema } from './validation.middleware.js';
import { ValidationError } from './error-handler.middleware.js';

function createMockReq(overrides: Record<string, unknown> = {}) {
  return { body: {}, query: {}, params: {}, ...overrides } as any;
}

function createMockRes() {
  return {} as any;
}

describe('validation.middleware', () => {
  // ── validateBody ──

  describe('validateBody', () => {
    it('calls next() when payload is valid', () => {
      const schema: ValidationSchema = {
        name: { type: 'string', required: true, min: 1, max: 50 },
        age: { type: 'number', required: true, min: 0, max: 150 },
      };
      const req = createMockReq({ body: { name: 'Alice', age: 30 } });
      const next = vi.fn();

      validateBody(schema)(req, createMockRes(), next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('throws ValidationError when required field is missing', () => {
      const schema: ValidationSchema = {
        name: { type: 'string', required: true },
      };
      const req = createMockReq({ body: {} });

      expect(() => validateBody(schema)(req, createMockRes(), vi.fn())).toThrow(ValidationError);

      try {
        validateBody(schema)(req, createMockRes(), vi.fn());
      } catch (err: any) {
        expect(err.status).toBe(400);
        expect(err.code).toBe('VALIDATION_ERROR');
        expect(err.details).toEqual(expect.arrayContaining([expect.stringContaining("'name'")]));
      }
    });

    it('throws ValidationError when field has wrong type', () => {
      const schema: ValidationSchema = {
        age: { type: 'number', required: true },
      };
      const req = createMockReq({ body: { age: 'not-a-number' } });

      expect(() => validateBody(schema)(req, createMockRes(), vi.fn())).toThrow(ValidationError);

      try {
        validateBody(schema)(req, createMockRes(), vi.fn());
      } catch (err: any) {
        expect(err.details).toEqual(expect.arrayContaining([expect.stringContaining("type 'number'")]));
      }
    });

    it('throws ValidationError when string is too short', () => {
      const schema: ValidationSchema = {
        name: { type: 'string', required: true, min: 3 },
      };
      const req = createMockReq({ body: { name: 'AB' } });

      expect(() => validateBody(schema)(req, createMockRes(), vi.fn())).toThrow(ValidationError);

      try {
        validateBody(schema)(req, createMockRes(), vi.fn());
      } catch (err: any) {
        expect(err.details).toEqual(expect.arrayContaining([expect.stringContaining('at least 3')]));
      }
    });

    it('throws ValidationError when string is too long', () => {
      const schema: ValidationSchema = {
        name: { type: 'string', required: true, max: 5 },
      };
      const req = createMockReq({ body: { name: 'TooLongName' } });

      expect(() => validateBody(schema)(req, createMockRes(), vi.fn())).toThrow(ValidationError);

      try {
        validateBody(schema)(req, createMockRes(), vi.fn());
      } catch (err: any) {
        expect(err.details).toEqual(expect.arrayContaining([expect.stringContaining('at most 5')]));
      }
    });

    it('throws ValidationError when number is below min', () => {
      const schema: ValidationSchema = {
        score: { type: 'number', required: true, min: 0 },
      };
      const req = createMockReq({ body: { score: -5 } });

      expect(() => validateBody(schema)(req, createMockRes(), vi.fn())).toThrow(ValidationError);

      try {
        validateBody(schema)(req, createMockRes(), vi.fn());
      } catch (err: any) {
        expect(err.details).toEqual(expect.arrayContaining([expect.stringContaining('at least 0')]));
      }
    });

    it('throws ValidationError when number exceeds max', () => {
      const schema: ValidationSchema = {
        score: { type: 'number', required: true, max: 100 },
      };
      const req = createMockReq({ body: { score: 150 } });

      expect(() => validateBody(schema)(req, createMockRes(), vi.fn())).toThrow(ValidationError);

      try {
        validateBody(schema)(req, createMockRes(), vi.fn());
      } catch (err: any) {
        expect(err.details).toEqual(expect.arrayContaining([expect.stringContaining('at most 100')]));
      }
    });

    it('throws ValidationError when value violates enum constraint', () => {
      const schema: ValidationSchema = {
        role: { type: 'string', required: true, enum: ['admin', 'user', 'viewer'] },
      };
      const req = createMockReq({ body: { role: 'superadmin' } });

      expect(() => validateBody(schema)(req, createMockRes(), vi.fn())).toThrow(ValidationError);

      try {
        validateBody(schema)(req, createMockRes(), vi.fn());
      } catch (err: any) {
        expect(err.details).toEqual(
          expect.arrayContaining([expect.stringContaining('admin, user, viewer')]),
        );
      }
    });

    it('collects multiple errors in one response', () => {
      const schema: ValidationSchema = {
        name: { type: 'string', required: true },
        age: { type: 'number', required: true },
        role: { type: 'string', required: true, enum: ['admin', 'user'] },
      };
      const req = createMockReq({ body: {} });

      try {
        validateBody(schema)(req, createMockRes(), vi.fn());
      } catch (err: any) {
        expect(err).toBeInstanceOf(ValidationError);
        expect((err.details as string[]).length).toBe(3);
      }
    });

    it('skips validation for optional fields that are absent', () => {
      const schema: ValidationSchema = {
        nickname: { type: 'string', required: false, min: 2 },
      };
      const req = createMockReq({ body: {} });
      const next = vi.fn();

      validateBody(schema)(req, createMockRes(), next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('validates array type correctly', () => {
      const schema: ValidationSchema = {
        tags: { type: 'array', required: true },
      };
      const reqGood = createMockReq({ body: { tags: ['a', 'b'] } });
      const next = vi.fn();
      validateBody(schema)(reqGood, createMockRes(), next);
      expect(next).toHaveBeenCalledTimes(1);

      const reqBad = createMockReq({ body: { tags: 'not-array' } });
      expect(() => validateBody(schema)(reqBad, createMockRes(), vi.fn())).toThrow(ValidationError);
    });
  });

  // ── validateQuery ──

  describe('validateQuery', () => {
    it('coerces string query values to numbers when type is number', () => {
      const schema: ValidationSchema = {
        page: { type: 'number', required: true, min: 1 },
      };
      const req = createMockReq({ query: { page: '3' } });
      const next = vi.fn();

      validateQuery(schema)(req, createMockRes(), next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.query.page).toBe(3);
    });

    it('throws when query number coercion fails', () => {
      const schema: ValidationSchema = {
        page: { type: 'number', required: true },
      };
      const req = createMockReq({ query: { page: 'abc' } });

      expect(() => validateQuery(schema)(req, createMockRes(), vi.fn())).toThrow(ValidationError);
    });

    it('validates string query params normally', () => {
      const schema: ValidationSchema = {
        status: { type: 'string', required: true, enum: ['active', 'inactive'] },
      };
      const req = createMockReq({ query: { status: 'active' } });
      const next = vi.fn();

      validateQuery(schema)(req, createMockRes(), next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('applies min/max to coerced numbers', () => {
      const schema: ValidationSchema = {
        limit: { type: 'number', required: true, min: 1, max: 100 },
      };
      const req = createMockReq({ query: { limit: '200' } });

      expect(() => validateQuery(schema)(req, createMockRes(), vi.fn())).toThrow(ValidationError);

      try {
        validateQuery(schema)(req, createMockRes(), vi.fn());
      } catch (err: any) {
        expect(err.details).toEqual(expect.arrayContaining([expect.stringContaining('at most 100')]));
      }
    });
  });

  // ── validateParams ──

  describe('validateParams', () => {
    it('validates required params', () => {
      const schema: ValidationSchema = {
        id: { type: 'number', required: true },
      };
      const req = createMockReq({ params: { id: '42' } });
      const next = vi.fn();

      validateParams(schema)(req, createMockRes(), next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('throws when required param is missing', () => {
      const schema: ValidationSchema = {
        id: { type: 'number', required: true },
      };
      const req = createMockReq({ params: {} });

      expect(() => validateParams(schema)(req, createMockRes(), vi.fn())).toThrow(ValidationError);
    });
  });
});
