import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authorize } from './rbac.middleware.js';

// Mock PrismaClient
vi.mock('@prisma/client', () => {
  const findUniqueMock = vi.fn();
  return {
    PrismaClient: vi.fn().mockImplementation(() => ({
      rolePermission: {
        findUnique: findUniqueMock,
      },
    })),
    __findUniqueMock: findUniqueMock,
  };
});

// Get the mock reference
async function getFindUniqueMock() {
  const mod = await import('@prisma/client');
  return (mod as any).__findUniqueMock as ReturnType<typeof vi.fn>;
}

function createMockReqRes(user?: any, params?: any, body?: any, query?: any) {
  const req = {
    user,
    params: params ?? {},
    body: body ?? {},
    query: query ?? {},
  } as any;

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as any;

  const next = vi.fn();
  return { req, res, next };
}

describe('authorize middleware', () => {
  let findUniqueMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    findUniqueMock = await getFindUniqueMock();
    findUniqueMock.mockReset();
  });

  it('should return 401 when req.user is missing', async () => {
    const middleware = authorize('assessment-units', 'read');
    const { req, res, next } = createMockReqRes(undefined);

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 401,
        code: 'AUTH_REQUIRED',
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 when no permission exists for the role', async () => {
    findUniqueMock.mockResolvedValue(null);

    const middleware = authorize('overrides', 'write');
    const { req, res, next } = createMockReqRes({
      userId: 1,
      username: 'auhead1',
      role: 'AUHead',
      assignedAuIds: [1, 2],
    });

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 403,
        code: 'RBAC_PERMISSION_DENIED',
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should allow access when permission exists with scope "all"', async () => {
    findUniqueMock.mockResolvedValue({
      id: 1,
      role: 'GCCO',
      resource: 'assessment-units',
      action: 'read',
      scope: 'all',
    });

    const middleware = authorize('assessment-units', 'read');
    const { req, res, next } = createMockReqRes({
      userId: 1,
      username: 'gcco',
      role: 'GCCO',
      assignedAuIds: [],
    });

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should allow AUHead access to assigned AUs with scope "assigned"', async () => {
    findUniqueMock.mockResolvedValue({
      id: 2,
      role: 'AUHead',
      resource: 'assessment-units',
      action: 'read',
      scope: 'assigned',
    });

    const middleware = authorize('assessment-units', 'read');
    const { req, res, next } = createMockReqRes(
      {
        userId: 5,
        username: 'auhead1',
        role: 'AUHead',
        assignedAuIds: [10, 20, 30],
      },
      { auId: '20' }, // params
    );

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should deny AUHead access to non-assigned AUs with scope "assigned"', async () => {
    findUniqueMock.mockResolvedValue({
      id: 2,
      role: 'AUHead',
      resource: 'assessment-units',
      action: 'read',
      scope: 'assigned',
    });

    const middleware = authorize('assessment-units', 'read');
    const { req, res, next } = createMockReqRes(
      {
        userId: 5,
        username: 'auhead1',
        role: 'AUHead',
        assignedAuIds: [10, 20, 30],
      },
      { auId: '99' }, // params — AU not in assigned list
    );

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 403,
        code: 'RBAC_AU_NOT_ASSIGNED',
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should allow "assigned" scope when no auId is present in request', async () => {
    findUniqueMock.mockResolvedValue({
      id: 2,
      role: 'AUHead',
      resource: 'dashboard',
      action: 'read',
      scope: 'assigned',
    });

    const middleware = authorize('dashboard', 'read');
    const { req, res, next } = createMockReqRes({
      userId: 5,
      username: 'auhead1',
      role: 'AUHead',
      assignedAuIds: [10, 20],
    });

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should extract auId from body when not in params', async () => {
    findUniqueMock.mockResolvedValue({
      id: 2,
      role: 'AUHead',
      resource: 'assessment-units',
      action: 'write',
      scope: 'assigned',
    });

    const middleware = authorize('assessment-units', 'write');
    const { req, res, next } = createMockReqRes(
      {
        userId: 5,
        username: 'auhead1',
        role: 'AUHead',
        assignedAuIds: [10, 20],
      },
      {}, // no params
      { auId: 10 }, // body
    );

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should extract auId from query when not in params or body', async () => {
    findUniqueMock.mockResolvedValue({
      id: 2,
      role: 'AUHead',
      resource: 'assessment-units',
      action: 'read',
      scope: 'assigned',
    });

    const middleware = authorize('assessment-units', 'read');
    const { req, res, next } = createMockReqRes(
      {
        userId: 5,
        username: 'auhead1',
        role: 'AUHead',
        assignedAuIds: [10, 20],
      },
      {}, // no params
      {}, // no body
      { auId: '10' }, // query
    );

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should attach rbacScope and rbacUserId for "own" scope', async () => {
    findUniqueMock.mockResolvedValue({
      id: 3,
      role: 'ComplianceMonitoring',
      resource: 'controls',
      action: 'write',
      scope: 'own',
    });

    const middleware = authorize('controls', 'write');
    const { req, res, next } = createMockReqRes({
      userId: 7,
      username: 'cm_user',
      role: 'ComplianceMonitoring',
      assignedAuIds: [],
    });

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.rbacScope).toBe('own');
    expect(req.rbacUserId).toBe(7);
  });

  it('should return structured error response with all required fields', async () => {
    findUniqueMock.mockResolvedValue(null);

    const middleware = authorize('overrides', 'delete');
    const { req, res, next } = createMockReqRes({
      userId: 1,
      username: 'user1',
      role: 'AUHead',
      assignedAuIds: [],
    });

    await middleware(req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: expect.any(Number),
        code: expect.any(String),
        message: expect.any(String),
        timestamp: expect.any(String),
      }),
    );
  });
});
