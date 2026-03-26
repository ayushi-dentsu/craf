import { useQuery } from '@tanstack/react-query';
import { get } from '../services/api';

export function useComplianceDashboard(periodId?: number) {
  const qs = periodId ? `?periodId=${periodId}` : '';
  return useQuery({
    queryKey: ['compliance', 'dashboard', periodId],
    queryFn: () => get<unknown>(`/dashboard/rbi-compliance${qs}`),
  });
}
