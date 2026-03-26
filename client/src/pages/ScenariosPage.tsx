import { useState } from 'react';
import { ScenarioSelector } from '../components/scenarios/ScenarioSelector';
import { WhatIfModeler } from '../components/scenarios/WhatIfModeler';

export function ScenariosPage() {
  const [selectedId, setSelectedId] = useState<1 | 2 | 3 | null>(null);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-foreground">Scenarios</h1>
      <ScenarioSelector selectedId={selectedId} onSelect={setSelectedId} />
      {selectedId && <WhatIfModeler scenarioId={selectedId} />}
    </div>
  );
}
