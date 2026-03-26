import { get, post } from './api';

export function getMateriality(periodId?: number) {
  const qs = periodId ? `?periodId=${periodId}` : '';
  return get<unknown>(`/materiality${qs}`);
}

export function saveMateriality(data: {
  periodId: number;
  profitBeforeTax: number;
  totalAssets: number;
  haircutPercent?: number;
  tolerableError?: number;
}) {
  return post<unknown>('/materiality', data);
}

export function getSignificantAccounts(periodId?: number) {
  const qs = periodId ? `?periodId=${periodId}` : '';
  return get<unknown>(`/materiality/significant-accounts${qs}`);
}
