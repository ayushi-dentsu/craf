import { get } from './api';
import type { AUDetailResponse } from '../types';

export interface AssessmentUnitSummary {
  id: number;
  code: string;
  name: string;
  businessArea: string;
  themeName: string;
  isActive: boolean;
}

export function listAssessmentUnits(filters?: { businessArea?: string; themeId?: number; isActive?: boolean }) {
  const params = new URLSearchParams();
  if (filters?.businessArea) params.set('businessArea', filters.businessArea);
  if (filters?.themeId) params.set('themeId', String(filters.themeId));
  if (filters?.isActive !== undefined) params.set('isActive', String(filters.isActive));
  const qs = params.toString();
  return get<AssessmentUnitSummary[]>(`/assessment-units${qs ? `?${qs}` : ''}`);
}

export function getAssessmentUnit(auId: number) {
  return get<AssessmentUnitSummary>(`/assessment-units/${auId}`);
}

export function getAUDetail(auId: number, periodId?: number) {
  const qs = periodId ? `?periodId=${periodId}` : '';
  return get<AUDetailResponse>(`/assessment-units/${auId}/detail${qs}`);
}
