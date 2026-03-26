import { useQuery } from '@tanstack/react-query';
import { getYearOverYear, getBeforeAfter } from '../services/comparison.service';

export function useYearOverYear(params: {
  auId: number;
  currentPeriodId?: number;
  previousPeriodId?: number;
}) {
  return useQuery({
    queryKey: ['comparison', 'yoy', params],
    queryFn: () => getYearOverYear(params),
    enabled: !!params.auId,
  });
}

export function useBeforeAfter(auId: number, periodId: number) {
  return useQuery({
    queryKey: ['comparison', 'before-after', auId, periodId],
    queryFn: () => getBeforeAfter(auId, periodId),
    enabled: !!auId && !!periodId,
  });
}
