import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ScenarioMetrics {
  label: string;
  before: { value: number | string; rating?: string };
  after: { value: number | string; rating?: string };
  delta?: number | null;
  higherIsBetter?: boolean;
  unit?: string;
}

interface WhatIfScenario {
  id: 1 | 2 | 3;
  title: string;
  auName: string;
  description: string;
  trigger: string;
  metrics: ScenarioMetrics[];
}

const SCENARIO_DATA: Record<1 | 2 | 3, WhatIfScenario> = {
  1: {
    id: 1,
    title: 'Audit Finding Remediation',
    auName: 'Trade Finance',
    description: 'A deficient LC control (CQA=1) is remediated to CQA=625. This shows the projected improvement in control quality and residual risk.',
    trigger: 'CQA score improved from 1 → 625 (Significantly Effective)',
    metrics: [
      { label: 'CQA Score', before: { value: 1, rating: 'Significant Improvement Needed' }, after: { value: 625, rating: 'Significantly Effective' }, delta: 62400, higherIsBetter: true },
      { label: 'CQI', before: { value: '40%' }, after: { value: '75%' }, delta: 87.5, higherIsBetter: true, unit: '%' },
      { label: 'CER Score', before: { value: 4 }, after: { value: 75 }, delta: 1775, higherIsBetter: true },
      { label: 'Inherent Risk Score', before: { value: 300, rating: 'Very High' }, after: { value: 300, rating: 'Very High' }, delta: 0 },
      { label: 'Residual Risk Score', before: { value: 300, rating: 'Significant Improvement Needed' }, after: { value: 120, rating: 'Improvement Needed' }, delta: -60, higherIsBetter: false },
    ],
  },
  2: {
    id: 2,
    title: 'Control Failure Investigation',
    auName: 'Retail Liabilities',
    description: 'CPA scores degraded over 3 consecutive months, triggering an early warning. Shows the cascading impact on CPI, CER, and residual risk.',
    trigger: 'CPA degraded from 25 → 5 over 3 months',
    metrics: [
      { label: 'CPA Score', before: { value: 25, rating: 'Significantly Effective' }, after: { value: 5, rating: 'Significant Improvement Needed' }, delta: -80, higherIsBetter: true },
      { label: 'CPI', before: { value: '80%' }, after: { value: '55%' }, delta: -31.25, higherIsBetter: true, unit: '%' },
      { label: 'CER Score', before: { value: 80 }, after: { value: 36 }, delta: -55, higherIsBetter: true },
      { label: 'Residual Risk Score', before: { value: 50, rating: 'Meets Requirement' }, after: { value: 95, rating: 'Improvement Needed' }, delta: 90, higherIsBetter: false },
      { label: 'Aggregate Rating', before: { value: 'Low' }, after: { value: 'Medium' }, delta: null },
    ],
  },
  3: {
    id: 3,
    title: 'New Regulation Impact',
    auName: 'Digital Lending',
    description: 'A new RBI regulation creates compliance gaps across 3 AUs. Shows the inherent risk increase and control gap analysis.',
    trigger: 'New RBI circular adds 12 new compliance obligations',
    metrics: [
      { label: 'New Obligations', before: { value: 0 }, after: { value: 12 }, delta: null },
      { label: 'Controls Gap', before: { value: 0 }, after: { value: 12, rating: 'No Control' }, delta: null },
      { label: 'Regulatory Returns Score', before: { value: 10, rating: 'Unlikely' }, after: { value: 20, rating: 'Likely' }, delta: 100, higherIsBetter: false },
      { label: 'Inherent Risk Score', before: { value: 150, rating: 'High' }, after: { value: 300, rating: 'Very High' }, delta: 100, higherIsBetter: false },
      { label: 'Aggregate Residual Risk', before: { value: '15%', rating: 'Medium' }, after: { value: '55%', rating: 'High' }, delta: null },
    ],
  },
};

interface WhatIfModelerProps {
  scenarioId: 1 | 2 | 3;
}

function MetricCard({ metric }: { metric: ScenarioMetrics }) {
  const improved =
    metric.delta != null
      ? metric.higherIsBetter
        ? metric.delta > 0
        : metric.delta < 0
      : null;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground mb-3">{metric.label}</p>
      <div className="flex items-center gap-3">
        {/* Before */}
        <div className="flex-1 rounded-md bg-muted/30 p-2.5 text-center">
          <p className="text-xs text-muted-foreground mb-0.5">Before</p>
          <p className="text-sm font-bold text-foreground">{String(metric.before.value)}{metric.unit ?? ''}</p>
          {metric.before.rating && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{metric.before.rating}</p>
          )}
        </div>

        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />

        {/* After */}
        <div
          className={cn(
            'flex-1 rounded-md p-2.5 text-center',
            improved === true && 'bg-green-50 border border-green-200',
            improved === false && 'bg-red-50 border border-red-200',
            improved === null && 'bg-muted/30',
          )}
        >
          <p className="text-xs text-muted-foreground mb-0.5">After</p>
          <p className="text-sm font-bold text-foreground">{String(metric.after.value)}{metric.unit ?? ''}</p>
          {metric.after.rating && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{metric.after.rating}</p>
          )}
        </div>
      </div>

      {/* Delta */}
      {metric.delta != null && (
        <div className="mt-2 flex justify-center">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-medium',
              improved === true && 'text-green-600',
              improved === false && 'text-red-600',
              improved === null && 'text-muted-foreground',
            )}
          >
            {improved === true ? (
              <TrendingDown className="h-3 w-3" />
            ) : improved === false ? (
              <TrendingUp className="h-3 w-3" />
            ) : null}
            {metric.delta > 0 ? '+' : ''}{metric.delta.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}

export function WhatIfModeler({ scenarioId }: WhatIfModelerProps) {
  const scenario = SCENARIO_DATA[scenarioId];

  return (
    <div className="space-y-5">
      {/* Scenario header */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">{scenario.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{scenario.description}</p>
          </div>
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {scenario.auName}
          </span>
        </div>
        <div className="mt-3 rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2">
          <p className="text-xs font-medium text-yellow-800">Trigger: {scenario.trigger}</p>
        </div>
      </div>

      {/* Projected outcomes grid */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Projected Outcomes
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {scenario.metrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </div>
      </div>
    </div>
  );
}
