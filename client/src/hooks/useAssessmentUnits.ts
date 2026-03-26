import { useQuery } from '@tanstack/react-query';
import { listAssessmentUnits, getAUDetail } from '../services/assessment-units.service';

export function useAssessmentUnits(filters?: { businessArea?: string; themeId?: number; isActive?: boolean }) {
  return useQuery({
    queryKey: ['assessment-units', filters],
    queryFn: () => listAssessmentUnits(filters),
  });
}

export function useAUDetail(auId: number, periodId?: number) {
  return useQuery({
    queryKey: ['assessment-units', auId, 'detail', periodId],
    queryFn: () => getAUDetail(auId, periodId),
    enabled: !!auId,
  });
}
