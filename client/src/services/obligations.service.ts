import { get } from './api';
import type { ObligationFullDetail } from '../types';

export function getObligationDetail(obligationId: number, periodId?: number) {
  const qs = periodId ? `?periodId=${periodId}` : '';
  return get<ObligationFullDetail>(`/compliance/${obligationId}${qs}`);
}
