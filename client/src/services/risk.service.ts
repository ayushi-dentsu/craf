import { get, post } from './api';

export function getInherentRisk(auId: number, periodId?: number) {
  const params = new URLSearchParams({ auId: String(auId) });
  if (periodId) params.set('periodId', String(periodId));
  return get<unknown>(`/inherent-risk?${params}`);
}

export function calculateInherentRisk(auId: number, periodId: number) {
  return post<unknown>('/inherent-risk/calculate', { auId, periodId });
}

export function getResidualRisk(auId: number, periodId?: number) {
  const params = new URLSearchParams({ auId: String(auId) });
  if (periodId) params.set('periodId', String(periodId));
  return get<unknown>(`/residual-risk?${params}`);
}

export function getAggregateResidualRisk(level: 'au' | 'theme' | 'enterprise', id?: number) {
  const params = new URLSearchParams({ level });
  if (id) params.set('id', String(id));
  return get<unknown>(`/residual-risk/aggregate?${params}`);
}

export function getEarlyWarnings() {
  return get<unknown>('/early-warnings');
}

export function getAUEarlyWarnings(auId: number) {
  return get<unknown>(`/early-warnings/${auId}`);
}
