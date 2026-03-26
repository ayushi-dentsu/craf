import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ControlState {
  cqiScore: number | null;
  cpiScore: number | null;
  cerScore: number | null;
  cerRating: string | null;
  residualRiskScore: number | null;
  residualRiskRating: string | null;
}

interface BeforeAfterData {
  auId: number;
  auName: string;
  currentPeriod: { id: number; name: string };
  previousPeriod: { id: number; name: string } | null;
  before: ControlState;
  after: ControlState;
  impact: {
    cqiDelta: number | null;
    cpiDelta: number | null;
    cerDelta: number | null;
    residualRiskDelta: number | null;
  };
}

interface BeforeAfterViewProps {
  data: BeforeAfterData;
}

function fmt(val: number | null, decimals = 1): string {
  if (val == null) return '—';
  return val.toFixed(decimals);
}

function DeltaIndicator({
  delta,
  higherIsBetter,
}: {
  delta: number | null;
  higherIsBetter: boolean;
}) {
  if (delta == null) return <span className="text-xs text-muted-foreground">—</span>;

  const improved = higherIsBetter ? delta > 0 : delta < 0;
  const neutral = delta === 0;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-medium',
        improved && 'text-green-600',
        !improved && !neutral && 'text-red-600',
        neutral && 'text-muted-foreground',
      )}
    >
      {neutral ? (
        <Minus className="h-3 w-3" />
      ) : improved ? (
        <TrendingDown className="h-3 w-3" />
      ) : (
        <TrendingUp className="h-3 w-3" />
      )}
      {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
    </span>
  );
}

function StateCard({
  title,
  period,
  state,
  variant,
}: {
  title: string;
  period: string;
  state: ControlState;
  variant: 'before' | 'after';
}) {
  return (
    <div
      className={cn(
        'flex-1 rounded-lg border p-5',
        variant === 'before' ? 'border-border bg-muted/20' : 'border-primary/30 bg-primary/5',
      )}
    >
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className="text-sm font-medium text-foreground mt-0.5">{period}</p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">CQI Score</span>
          <span className="text-sm font-semibold text-foreground">
            {state.cqiScore != null ? `${fmt(state.cqiScore)}%` : '—'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">CPI Score</span>
          <span className="text-sm font-semibold text-foreground">
            {state.cpiScore != null ? `${fmt(state.cpiScore)}%` : '—'}
          </span>
        </div>
        <div className="flex justify-between items-center border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">CER Score</span>
          <span className="text-sm font-bold text-foreground">{fmt(state.cerScore)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">CER Rating</span>
          <span className="text-sm font-medium text-foreground">{state.cerRating ?? '—'}</span>
        </div>
        <div className="flex justify-between items-center border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Residual Risk</span>
          <span className="text-sm font-bold text-foreground">{fmt(state.residualRiskScore)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">RR Rating</span>
          <span className="text-sm font-medium text-foreground">{state.residualRiskRating ?? '—'}</span>
        </div>
      </div>
    </div>
  );
}

export function BeforeAfterView({ data }: BeforeAfterViewProps) {
  const { before, after, impact } = data;
  const beforePeriodName = data.previousPeriod?.name ?? 'Previous Period';
  const afterPeriodName = data.currentPeriod.name;

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground">Before / After Comparison</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{data.auName}</p>
      </div>

      {/* Split screen */}
      <div className="flex items-stretch gap-4 p-5">
        <StateCard title="Before" period={beforePeriodName} state={before} variant="before" />

        <div className="flex flex-col items-center justify-center gap-2 px-2">
          <ArrowRight className="h-6 w-6 text-muted-foreground" />
        </div>

        <StateCard title="After" period={afterPeriodName} state={after} variant="after" />
      </div>

      {/* Impact summary */}
      <div className="border-t border-border px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Impact Summary
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'CQI Change', delta: impact.cqiDelta, higherIsBetter: true },
            { label: 'CPI Change', delta: impact.cpiDelta, higherIsBetter: true },
            { label: 'CER Change', delta: impact.cerDelta, higherIsBetter: true },
            { label: 'Residual Risk Change', delta: impact.residualRiskDelta, higherIsBetter: false },
          ].map(({ label, delta, higherIsBetter }) => (
            <div key={label} className="rounded-md bg-muted/30 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <DeltaIndicator delta={delta} higherIsBetter={higherIsBetter} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
