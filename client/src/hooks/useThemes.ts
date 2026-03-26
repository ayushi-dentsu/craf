import { useQuery } from '@tanstack/react-query';
import { listThemes, getThemeDetail } from '../services/themes.service';

export function useThemes() {
  return useQuery({
    queryKey: ['themes'],
    queryFn: listThemes,
  });
}

export function useThemeDetail(themeId: number, periodId?: number) {
  return useQuery({
    queryKey: ['themes', themeId, 'detail', periodId],
    queryFn: () => getThemeDetail(themeId, periodId),
    enabled: !!themeId,
  });
}
