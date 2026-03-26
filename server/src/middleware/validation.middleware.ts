import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './error-handler.middleware.js';

// ── Schema Types ──

export interface FieldSchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  min?: number; // min length for strings, min value for numbers
  max?: number; // max length for strings, max value for numbers
  enum?: string[]; // allowed values
}

export type ValidationSchema = Record<string, FieldSchema>;

// ── Core Validation Logic ──

function validateValue(
  field: string,
  value: unknown,
  schema: FieldSchema,
  coerceNumbers: boolean,
): { errors: string[]; coerced?: unknown } {
  const errors: string[] = [];

  if (value === undefined || value === null || value === '') {
    if (schema.required) {
      errors.push(`Field '${field}' is required.`);
    }
    return { errors };
  }

  let actual = value;

  // Coerce string to number when expected type is number (for query/params)
  if (coerceNumbers && schema.type === 'number' && typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      errors.push(`Field '${field}' must be of type 'number'.`);
      return { errors };
    }
    actual = parsed;
  }

  // Type check
  if (schema.type === 'array') {
    if (!Array.isArray(actual)) {
      errors.push(`Field '${field}' must be of type 'array'.`);
      return { errors };
    }
  } else if (typeof actual !== schema.type) {
    errors.push(`Field '${field}' must be of type '${schema.type}'.`);
    return { errors };
  }

  // Min / Max for strings (length)
  if (schema.type === 'string' && typeof actual === 'string') {
    if (schema.min !== undefined && actual.length < schema.min) {
      errors.push(`Field '${field}' must have at least ${schema.min} characters.`);
    }
    if (schema.max !== undefined && actual.length > schema.max) {
      errors.push(`Field '${field}' must have at most ${schema.max} characters.`);
    }
  }

  // Min / Max for numbers (value)
  if (schema.type === 'number' && typeof actual === 'number') {
    if (schema.min !== undefined && actual < schema.min) {
      errors.push(`Field '${field}' must be at least ${schema.min}.`);
    }
    if (schema.max !== undefined && actual > schema.max) {
      errors.push(`Field '${field}' must be at most ${schema.max}.`);
    }
  }

  // Enum check
  if (schema.enum && !schema.enum.includes(String(actual))) {
    errors.push(`Field '${field}' must be one of: ${schema.enum.join(', ')}.`);
  }

  return { errors, coerced: actual };
}

function validateObject(
  data: Record<string, unknown>,
  schema: ValidationSchema,
  coerceNumbers: boolean,
): { errors: string[]; coerced: Record<string, unknown> } {
  const errors: string[] = [];
  const coerced: Record<string, unknown> = { ...data };

  for (const [field, fieldSchema] of Object.entries(schema)) {
    const result = validateValue(field, data[field], fieldSchema, coerceNumbers);
    errors.push(...result.errors);
    if (result.coerced !== undefined) {
      coerced[field] = result.coerced;
    }
  }

  return { errors, coerced };
}

// ── Middleware Factories ──

export function validateBody(schema: ValidationSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { errors } = validateObject(req.body ?? {}, schema, false);
    if (errors.length > 0) {
      throw new ValidationError('Validation failed.', errors);
    }
    next();
  };
}

export function validateQuery(schema: ValidationSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const data = (req.query ?? {}) as Record<string, unknown>;
    const { errors, coerced } = validateObject(data, schema, true);
    if (errors.length > 0) {
      throw new ValidationError('Validation failed.', errors);
    }
    // Replace query with coerced values so downstream handlers get proper types
    req.query = coerced as any;
    next();
  };
}

export function validateParams(schema: ValidationSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const data = (req.params ?? {}) as Record<string, unknown>;
    const { errors } = validateObject(data, schema, true);
    if (errors.length > 0) {
      throw new ValidationError('Validation failed.', errors);
    }
    next();
  };
}
