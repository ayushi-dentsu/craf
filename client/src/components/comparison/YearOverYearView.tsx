import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PeriodMetrics {
  inherentRiskScore: number | null;
  inherentRiskRating: string | null;
  cqiScore: number | null;
  cpiScore: number | null;
  cerScore: number | null;
  cerRating: string | null;
  residualRiskScore: number | null;
  residualRiskRating: string | null;
  aggregateResidual: number | null;
  aggregateRating: string | null;
}

interface DeltaInfo {
  delta: number | null;
  color: string | null;
}

interface YearOverYearData {
  auId?: number;
  auName?: string;
  currentPeriod: { id: number; name: string };
  previousPeriod: { id: number; name: string };
  current: PeriodMetrics;
  previous: PeriodMetrics;
  deltas: {
    inherentRisk: DeltaInfo;
    cer: DeltaInfo;
    residualRisk: DeltaInfo;
    aggregateResidual: DeltaInfo;
  };
}

interface YearOverYearViewProps {
  data: YearOverYearData;
  level?: 'enterprise' | 'theme' | 'au';
}

function DeltaBadge({ delta, color }: DeltaInfo) {
  if (delta == null) return <span className="text-xs text-muted-foreground">—</span>;

  const isGreen = color === 'green';
  const isRed = color === 'red';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
        isGreen && 'bg-green-100 text-green-700',
        isRed && 'bg-red-100 text-red-700',
        !isGreen && !isRed && 'bg-gray-100 text-gray-600',
      )}
    >
      {isGreen ? <TrendingDown className="h-3 w-3" /> : isRed ? <TrendingUp className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
      {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
    </span>
  );
}

function MetricRow({
  label,
  current,
  previous,
  delta,
}: {
  label: string;
  current: string | number | null;
  previous: string | number | null;
  delta: DeltaInfo;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground w-24 text-right">
        {previous ?? '—'}
      </span>
      <span className="text-sm font-semibold text-foreground w-24 text-right">
        {current ?? '—'}
      </span>
      <div className="w-20 flex justify-end">
        <DeltaBadge {...delta} />
      </div>
    </div>
  );
}

function fmt(val: number | null, decimals = 1): string {
  if (val == null) return '—';
  return val.toFixed(decimals);
}

export function YearOverYearView({ data, level = 'au' }: YearOverYearViewProps) {
  const { currentPeriod, previousPeriod, current, previous, deltas } = data;

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Year-over-Year Comparison</h2>
          {data.auName && (
            <p className="text-sm text-muted-foreground mt-0.5">{data.auName}</p>
          )}
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary capitalize">
          {level} level
        </span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-2 bg-muted/30">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Metric</span>
        <span className="text-xs font-medium text-muted-foreground w-24 text-right">{previousPeriod.name}</span>
        <span className="text-xs font-medium text-muted-foreground w-24 text-right">{currentPeriod.name}</span>
        <span className="text-xs font-medium text-muted-foreground w-20 text-right">Change</span>
      </div>

      {/* Inherent Risk section */}
      <div className="px-5 pt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Inherent Risk</p>
        <MetricRow
          label="IR Score"
          previous={fmt(previous.inherentRiskScore, 0)}
          current={fmt(current.inherentRiskScore, 0)}
          delta={deltas.inherentRisk}
        />
        <MetricRow
          label="IR Rating"
          previous={previous.inherentRiskRating}
          current={current.inherentRiskRating}
          delta={{ delta: null, color: null }}
        />
      </div>

      {/* Control Environment section */}
      <div className="px-5 pt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Control Environment</p>
        <MetricRow
          label="CQI Score"
          previous={previous.cqiScore != null ? `${fmt(previous.cqiScore)}%` : null}
          current={current.cqiScore != null ? `${fmt(current.cqiScore)}%` : null}
          delta={{ delta: null, color: null }}
        />
        <MetricRow
          label="CPI Score"
          previous={previous.cpiScore != null ? `${fmt(previous.cpiScore)}%` : null}
          current={current.cpiScore != null ? `${fmt(current.cpiScore)}%` : null}
          delta={{ delta: null, color: null }}
        />
        <MetricRow
          label="CER Score"
          previous={fmt(previous.cerScore)}
          current={fmt(current.cerScore)}
          delta={deltas.cer}
        />
        <MetricRow
          label="CER Rating"
          previous={previous.cerRating}
          current={current.cerRating}
          delta={{ delta: null, color: null }}
        />
      </div>

      {/* Residual Risk section */}
      <div className="px-5 pt-3 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Residual Risk</p>
        <MetricRow
          label="RR Score"
          previous={fmt(previous.residualRiskScore)}
          current={fmt(current.residualRiskScore)}
          delta={deltas.residualRisk}
        />
        <MetricRow
          label="RR Rating"
          previous={previous.residualRiskRating}
          current={current.residualRiskRating}
          delta={{ delta: null, color: null }}
        />
        <MetricRow
          label="Aggregate Residual"
          previous={previous.aggregateResidual != null ? `${fmt(previous.aggregateResidual)}%` : null}
          current={current.aggregateResidual != null ? `${fmt(current.aggregateResidual)}%` : null}
          delta={deltas.aggregateResidual}
        />
        <MetricRow
          label="Aggregate Rating"
          previous={previous.aggregateRating}
          current={current.aggregateRating}
          delta={{ delta: null, color: null }}
        />
      </div>
    </div>
  );
}
