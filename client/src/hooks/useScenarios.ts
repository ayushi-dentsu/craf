import { useQuery } from '@tanstack/react-query';
import { getAllScenarios, type AllScenarioData } from '../services/scenarios.service';

export function useScenarios() {
  return useQuery<AllScenarioData>({
    queryKey: ['scenarios'],
    queryFn: getAllScenarios,
  });
}
