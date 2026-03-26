import { get } from './api';
import type { ThemeDetailResponse } from '../types';

export interface ThemeSummary {
  id: number;
  code: string;
  name: string;
  description: string | null;
}

export function listThemes() {
  return get<ThemeSummary[]>('/themes');
}

export function getThemeDetail(themeId: number, periodId?: number) {
  const params = new URLSearchParams();
  if (periodId) params.set('periodId', String(periodId));
  const qs = params.toString();
  return get<ThemeDetailResponse>(`/themes/${themeId}/detail${qs ? `?${qs}` : ''}`);
}

export function getThemeAssessmentUnits(themeId: number) {
  return get<unknown>(`/themes/${themeId}/assessment-units`);
}
