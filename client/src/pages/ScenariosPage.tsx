import { useState } from 'react';
import { ScenarioSelector } from '../components/scenarios/ScenarioSelector';
import { WhatIfModeler } from '../components/scenarios/WhatIfModeler';
import { useScenarios } from '../hooks/useScenarios';
import { ScenarioBeforeAfterView } from '../components/scenarios/ScenarioBeforeAfterView';
import { ScenarioDegradationView } from '../components/scenarios/ScenarioDegradationView';

export function ScenariosPage() {
  const [selectedId, setSelectedId] = useState<1 | 2 | 3 | null>(null);
  const { data, isLoading, error } = useScenarios();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-foreground">Demo Scenarios</h1>
      <ScenarioSelector selectedId={selectedId} onSelect={setSelectedId} />

      {selectedId && isLoading && (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" role="status">
            <span className="sr-only">Loading scenario data…</span>
          </div>
        </div>
      )}

      {selectedId && error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">Failed to load scenario data. Please ensure the server is running and seeded.</p>
        </div>
      )}

      {selectedId === 1 && data && (
        <ScenarioBeforeAfterView data={data.scenario1} />
      )}

      {selectedId === 2 && data && (
        <ScenarioDegradationView data={data.scenario2} />
      )}

      {selectedId === 3 && data && (
        <WhatIfModeler data={data.scenario3} />
      )}
    </div>
  );
}
