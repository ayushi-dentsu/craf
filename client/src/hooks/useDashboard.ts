import { useQuery } from '@tanstack/react-query';
import { getExecutiveDashboard, getKPIs, getHeatmap, getTrends } from '../services/dashboard.service';

export function useDashboard(periodId?: number, viewMode?: string) {
  return useQuery({
    queryKey: ['dashboard', 'executive', periodId, viewMode],
    queryFn: () => getExecutiveDashboard(periodId, viewMode),
  });
}

export function useKPIs(periodId?: number) {
  return useQuery({
    queryKey: ['dashboard', 'kpis', periodId],
    queryFn: () => getKPIs(periodId),
  });
}

export function useHeatmap(filters?: { periodId?: number; businessArea?: string; riskRating?: string; themeId?: number }) {
  return useQuery({
    queryKey: ['dashboard', 'heatmap', filters],
    queryFn: () => getHeatmap(filters),
  });
}

export function useTrends(periodId?: number) {
  return useQuery({
    queryKey: ['dashboard', 'trends', periodId],
    queryFn: () => getTrends(periodId),
  });
}
