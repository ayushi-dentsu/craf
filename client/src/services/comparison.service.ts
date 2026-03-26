import { get } from './api';

export function getYearOverYear(params: {
  auId: number;
  currentPeriodId?: number;
  previousPeriodId?: number;
  themeId?: number;
}) {
  const qs = new URLSearchParams({ auId: String(params.auId) });
  if (params.currentPeriodId) qs.set('currentPeriodId', String(params.currentPeriodId));
  if (params.previousPeriodId) qs.set('previousPeriodId', String(params.previousPeriodId));
  if (params.themeId) qs.set('themeId', String(params.themeId));
  return get<unknown>(`/comparison/year-over-year?${qs}`);
}

export function getBeforeAfter(auId: number, periodId: number) {
  const qs = new URLSearchParams({ auId: String(auId), periodId: String(periodId) });
  return get<unknown>(`/comparison/before-after?${qs}`);
}
