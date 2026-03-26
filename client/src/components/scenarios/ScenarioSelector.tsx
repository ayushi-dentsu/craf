import { cn } from '../../lib/utils';

export interface Scenario {
  id: 1 | 2 | 3;
  title: string;
  description: string;
  auName: string;
  theme: string;
}

export const DEMO_SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: 'Audit Finding Remediation',
    description: 'Trade Finance AU with a deficient LC control being remediated. Shows CQI improvement from 40% to 75% and residual risk drop from 300 to 120.',
    auName: 'Trade Finance',
    theme: 'Trade Finance & Forex',
  },
  {
    id: 2,
    title: 'Control Failure Investigation',
    description: 'Retail Liabilities AU with early warning triggered. CPA degraded over 3 months, CPI dropped from 80% to 55%, residual risk increased from 50 to 95.',
    auName: 'Retail Liabilities',
    theme: 'Retail Banking',
  },
  {
    id: 3,
    title: 'New Regulation Impact',
    description: 'Digital Lending AU impacted by new RBI regulation. Shows inherent risk increase and control gap analysis across 3 affected AUs.',
    auName: 'Digital Lending',
    theme: 'Digital Banking',
  },
];

interface ScenarioSelectorProps {
  selectedId: 1 | 2 | 3 | null;
  onSelect: (id: 1 | 2 | 3) => void;
}

export function ScenarioSelector({ selectedId, onSelect }: ScenarioSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">Select a demo scenario to explore:</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {DEMO_SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onSelect(scenario.id)}
            className={cn(
              'rounded-lg border p-4 text-left transition-all hover:border-primary/50 hover:bg-primary/5',
              selectedId === scenario.id
                ? 'border-primary bg-primary/10 ring-1 ring-primary'
                : 'border-border bg-card',
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  selectedId === scenario.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {scenario.id}
              </span>
              <p className="text-sm font-semibold text-foreground">{scenario.title}</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{scenario.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {scenario.auName}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {scenario.theme}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
