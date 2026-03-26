import { useQuery } from '@tanstack/react-query';
import { getObligationDetail } from '../services/obligations.service';

export function useObligationDetail(obligationId: number, periodId?: number) {
  return useQuery({
    queryKey: ['obligations', obligationId, 'detail', periodId],
    queryFn: () => getObligationDetail(obligationId, periodId),
    enabled: !!obligationId,
  });
}
