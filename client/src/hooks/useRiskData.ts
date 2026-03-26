import { useQuery } from '@tanstack/react-query';
import { getInherentRisk, getResidualRisk, getEarlyWarnings, getAUEarlyWarnings } from '../services/risk.service';

export function useInherentRisk(auId: number, periodId?: number) {
  return useQuery({
    queryKey: ['inherent-risk', auId, periodId],
    queryFn: () => getInherentRisk(auId, periodId),
    enabled: !!auId,
  });
}

export function useResidualRisk(auId: number, periodId?: number) {
  return useQuery({
    queryKey: ['residual-risk', auId, periodId],
    queryFn: () => getResidualRisk(auId, periodId),
    enabled: !!auId,
  });
}

export function useEarlyWarnings() {
  return useQuery({
    queryKey: ['early-warnings'],
    queryFn: getEarlyWarnings,
  });
}

export function useAUEarlyWarnings(auId: number) {
  return useQuery({
    queryKey: ['early-warnings', auId],
    queryFn: () => getAUEarlyWarnings(auId),
    enabled: !!auId,
  });
}
