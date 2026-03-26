import { get } from './api';
import type { ExecutiveDashboardResponse } from '../types';

export function getExecutiveDashboard(periodId?: number, viewMode?: string) {
  const params = new URLSearchParams();
  if (periodId) params.set('periodId', String(periodId));
  if (viewMode) params.set('viewMode', viewMode);
  const qs = params.toString();
  return get<ExecutiveDashboardResponse>(`/dashboard/executive${qs ? `?${qs}` : ''}`);
}

export function getKPIs(periodId?: number) {
  const qs = periodId ? `?periodId=${periodId}` : '';
  return get<ExecutiveDashboardResponse['kpis']>(`/dashboard/executive/kpis${qs}`);
}

export function getHeatmap(filters?: { periodId?: number; businessArea?: string; riskRating?: string; themeId?: number }) {
  const params = new URLSearchParams();
  if (filters?.periodId) params.set('periodId', String(filters.periodId));
  if (filters?.businessArea) params.set('businessArea', filters.businessArea);
  if (filters?.riskRating) params.set('riskRating', filters.riskRating);
  if (filters?.themeId) params.set('themeId', String(filters.themeId));
  const qs = params.toString();
  return get<ExecutiveDashboardResponse['heatmap']>(`/dashboard/executive/heatmap${qs ? `?${qs}` : ''}`);
}

export function getTrends(periodId?: number) {
  const qs = periodId ? `?periodId=${periodId}` : '';
  return get<ExecutiveDashboardResponse['trends']>(`/dashboard/executive/trends${qs}`);
}
