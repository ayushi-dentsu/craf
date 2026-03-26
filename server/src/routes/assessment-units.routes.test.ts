import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

// Hoist mock so it's available when vi.mock factory runs
const mockPrisma = vi.hoisted(() => ({
  assessmentUnit: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  assessmentPeriod: {
    findFirst: vi.fn(),
  },
  inherentRisk: {
    findUnique: vi.fn(),
  },
  controlEnvironmentRating: {
    findUnique: vi.fn(),
  },
  residualRisk: {
    findUnique: vi.fn(),
  },
  complianceObligation: {
    findMany: vi.fn(),
  },
  aUVolumeDefinition: {
    findUnique: vi.fn(),
  },
  rolePermission: {
    findUnique: vi.fn(),
  },
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

// Mock auth middleware to inject a test user
vi.mock('../middleware/auth.middleware.js', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { userId: 1, username: 'testuser', role: 'GCCO', assignedAuIds: [1, 2, 3] };
    next();
  },
}));

// Mock RBAC middleware — allow all for GCCO scope
vi.mock('../middleware/rbac.middleware.js', () => ({
  authorize: () => (_req: any, _res: any, next: any) => next(),
}));

import assessmentUnitsRoutes from './assessment-units.routes.js';
import { errorHandler } from '../middleware/error-handler.middleware.js';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/assessment-units', assessmentUnitsRoutes);
  app.use(errorHandler);
  return app;
}

describe('Assessment Units Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/assessment-units', () => {
    it('returns a list of assessment units', async () => {
      const mockAUs = [
        { id: 1, code: 'AU001', name: 'Savings Accounts', businessArea: 'Retail Banking', theme: { id: 1, name: 'KYC/AML' } },
        { id: 2, code: 'AU002', name: 'Trade Finance', businessArea: 'Corporate/Wholesale Banking', theme: { id: 2, name: 'Trade' } },
      ];
      mockPrisma.assessmentUnit.findMany.mockResolvedValue(mockAUs);

      const app = createApp();
      const res = await request(app).get('/api/assessment-units');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].code).toBe('AU001');
    });

    it('filters by businessArea', async () => {
      mockPrisma.assessmentUnit.findMany.mockResolvedValue([]);

      const app = createApp();
      await request(app).get('/api/assessment-units?businessArea=Retail%20Banking');

      expect(mockPrisma.assessmentUnit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ businessArea: 'Retail Banking' }),
        }),
      );
    });

    it('filters by themeId', async () => {
      mockPrisma.assessmentUnit.findMany.mockResolvedValue([]);

      const app = createApp();
      await request(app).get('/api/assessment-units?themeId=5');

      expect(mockPrisma.assessmentUnit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ themeId: 5 }),
        }),
      );
    });

    it('filters by isActive', async () => {
      mockPrisma.assessmentUnit.findMany.mockResolvedValue([]);

      const app = createApp();
      await request(app).get('/api/assessment-units?isActive=true');

      expect(mockPrisma.assessmentUnit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        }),
      );
    });
  });

  describe('GET /api/assessment-units/:auId', () => {
    it('returns AU basic info when found', async () => {
      const mockAU = {
        id: 1,
        code: 'AU001',
        name: 'Savings Accounts',
        businessArea: 'Retail Banking',
        theme: { id: 1, name: 'KYC/AML' },
        volumeDefinition: null,
        productComplexity: null,
        systemComplexities: [],
      };
      mockPrisma.assessmentUnit.findUnique.mockResolvedValue(mockAU);

      const app = createApp();
      const res = await request(app).get('/api/assessment-units/1');

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('AU001');
    });

    it('returns 404 when AU not found', async () => {
      mockPrisma.assessmentUnit.findUnique.mockResolvedValue(null);

      const app = createApp();
      const res = await request(app).get('/api/assessment-units/999');

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');
    });

    it('returns 400 for invalid auId', async () => {
      const app = createApp();
      const res = await request(app).get('/api/assessment-units/abc');

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/assessment-units/:auId/detail', () => {
    it('returns full AU detail with risk data', async () => {
      const mockAU = {
        id: 1, code: 'AU001', name: 'Savings Accounts',
        businessArea: 'Retail Banking', ownerName: 'John Doe',
        theme: { name: 'KYC/AML' },
      };
      const mockIR = {
        likelihoodScore: 15, likelihoodRating: 'Possible',
        volumeGrowthScore: 10, complexityScore: 15,
        regulatoryReturnsScore: 10, complianceBreachesScore: 5,
        controlFailuresScore: 5, customerComplaintsScore: 10,
        impactScore: 20, impactRating: 'Likely',
        businessImpactScore: 20, reputationalImpactScore: 15,
        financialPenaltyScore: 5, glImpactScore: 15,
        inherentRiskScore: 300, inherentRiskRating: 'Very High',
      };
      const mockCER = {
        cqiScore: 75, cqiInterpScore: 16,
        cpiScore: 65, cpiInterpScore: 9,
        cerScore: 144, cerRating: 'Effective',
      };
      const mockRR = {
        residualRiskScore: 2.08, residualRiskRating: 'Improvement Needed',
        aggregateResidual: 35, aggregateRating: 'Medium',
      };

      mockPrisma.assessmentUnit.findUnique.mockResolvedValue(mockAU);
      mockPrisma.assessmentPeriod.findFirst.mockResolvedValue({ id: 1 });
      mockPrisma.inherentRisk.findUnique.mockResolvedValue(mockIR);
      mockPrisma.controlEnvironmentRating.findUnique.mockResolvedValue(mockCER);
      mockPrisma.residualRisk.findUnique.mockResolvedValue(mockRR);
      mockPrisma.complianceObligation.findMany.mockResolvedValue([]);

      const app = createApp();
      const res = await request(app).get('/api/assessment-units/1/detail');

      expect(res.status).toBe(200);
      expect(res.body.auInfo.code).toBe('AU001');
      expect(res.body.inherentRisk.inherentRiskScore).toBe(300);
      expect(res.body.controlEnvironment.cerRating).toBe('Effective');
      expect(res.body.residualRisk.residualRiskScore).toBe(2.08);
    });

    it('returns 404 when AU not found', async () => {
      mockPrisma.assessmentUnit.findUnique.mockResolvedValue(null);

      const app = createApp();
      const res = await request(app).get('/api/assessment-units/999/detail');

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/assessment-units/:auId/volume-definition', () => {
    it('returns volume definition when found', async () => {
      const mockVolDef = {
        id: 1, auId: 1, volumeDefinition: 'Number of savings accounts',
        currentVolume: 150000, previousVolume: 120000, growthPercent: 25,
      };
      mockPrisma.assessmentUnit.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.aUVolumeDefinition.findUnique.mockResolvedValue(mockVolDef);

      const app = createApp();
      const res = await request(app).get('/api/assessment-units/1/volume-definition');

      expect(res.status).toBe(200);
      expect(res.body.volumeDefinition).toBe('Number of savings accounts');
      expect(res.body.growthPercent).toBe(25);
    });

    it('returns 404 when AU not found', async () => {
      mockPrisma.assessmentUnit.findUnique.mockResolvedValue(null);

      const app = createApp();
      const res = await request(app).get('/api/assessment-units/999/volume-definition');

      expect(res.status).toBe(404);
    });

    it('returns 404 when volume definition not found', async () => {
      mockPrisma.assessmentUnit.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.aUVolumeDefinition.findUnique.mockResolvedValue(null);

      const app = createApp();
      const res = await request(app).get('/api/assessment-units/1/volume-definition');

      expect(res.status).toBe(404);
    });
  });
});
