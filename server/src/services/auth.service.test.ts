import { describe, it, expect } from 'vitest';
import {
  generateToken,
  verifyToken,
  verifyPassword,
  hashPassword,
  type JwtPayload,
} from './auth.service.js';

describe('auth.service', () => {
  const samplePayload: JwtPayload = {
    userId: 1,
    username: 'gcco_admin',
    role: 'GCCO',
    assignedAuIds: [1, 2, 3],
  };

  describe('generateToken / verifyToken', () => {
    it('should generate a valid JWT and decode it back', () => {
      const token = generateToken(samplePayload);
      expect(typeof token).toBe('string');

      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(samplePayload.userId);
      expect(decoded.username).toBe(samplePayload.username);
      expect(decoded.role).toBe(samplePayload.role);
      expect(decoded.assignedAuIds).toEqual(samplePayload.assignedAuIds);
    });

    it('should throw on an invalid token', () => {
      expect(() => verifyToken('invalid.token.here')).toThrow();
    });

    it('should throw on a tampered token', () => {
      const token = generateToken(samplePayload);
      const tampered = token.slice(0, -5) + 'XXXXX';
      expect(() => verifyToken(tampered)).toThrow();
    });
  });

  describe('verifyPassword / hashPassword', () => {
    it('should verify a correct password', async () => {
      const hash = await hashPassword('secret123');
      const result = await verifyPassword('secret123', hash);
      expect(result).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const hash = await hashPassword('secret123');
      const result = await verifyPassword('wrong', hash);
      expect(result).toBe(false);
    });
  });
});
