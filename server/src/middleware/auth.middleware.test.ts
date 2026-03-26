import { describe, it, expect, vi } from 'vitest';
import { authenticate } from './auth.middleware.js';
import { generateToken, type JwtPayload } from '../services/auth.service.js';

function createMockReqRes(authHeader?: string) {
  const req = {
    headers: { authorization: authHeader },
  } as any;

  const resBody: any = {};
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn((body: any) => {
      Object.assign(resBody, body);
    }),
  } as any;

  const next = vi.fn();
  return { req, res, next, resBody };
}

describe('authenticate middleware', () => {
  const payload: JwtPayload = {
    userId: 1,
    username: 'testuser',
    role: 'GCCO',
    assignedAuIds: [],
  };

  it('should call next and attach user for a valid token', () => {
    const token = generateToken(payload);
    const { req, res, next } = createMockReqRes(`Bearer ${token}`);

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe(1);
    expect(req.user.username).toBe('testuser');
    expect(req.user.role).toBe('GCCO');
  });

  it('should return 401 when no Authorization header is present', () => {
    const { req, res, next } = createMockReqRes(undefined);

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when Authorization header does not start with Bearer', () => {
    const { req, res, next } = createMockReqRes('Basic abc123');

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 for an invalid token', () => {
    const { req, res, next } = createMockReqRes('Bearer invalid.token.value');

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
