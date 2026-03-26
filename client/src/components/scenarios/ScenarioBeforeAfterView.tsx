import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ScenarioBeforeAfter } from '../../services/scenarios.service';

interface ScenarioBeforeAfterViewProps {
  data: ScenarioBeforeAfter;
}

function fmt(val: number | null | undefined, decimals = 1): string {
  if (val == null) return '—';
  return val.toFixed(decimals);
}

function DeltaIndicator({ before, after, higherIsBetter }: { before: number; after: number; higherIsBetter: boolean }) {
  if (before === 0 && after === 0) return <span className="text-xs text-muted-foreground">—</span>;
  const delta = before !== 0 ? ((after - before) / before) * 100 : null;
  if (delta == null) return <span className="text-xs text-muted-foreground">—</span>;

  const improved = higherIsBetter ? delta > 0 : delta < 0;
  const neutral = Math.abs(delta) < 0.1;

  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 text-xs font-medium',
      neutral && 'text-muted-foreground',
      !neutral && improved && 'text-green-600',
      !neutral && !improved && 'text-red-600',
    )}>
      {neutral ? <Minus className="h-3 w-3" /> : improved ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
      {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
    </span>
  );
}

function MetricRow({ label, beforeVal, afterVal, unit, higherIsBetter }: {
  label: string;
  beforeVal: string;
  afterVal: string;
  unit?: string;
  higherIsBetter: boolean;
}) {
  const bNum = parseFloat(beforeVal);
  const aNum = parseFloat(afterVal);
  const canDelta = !isNaN(bNum) && !isNaN(aNum);

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground w-28 text-right">{beforeVal}{unit ?? ''}</span>
      <span className="text-sm font-semibold text-foreground w-28 text-right">{afterVal}{unit ?? ''}</span>
      <div className="w-24 flex justify-end">
        {canDelta ? <DeltaIndicator before={bNum} after={aNum} higherIsBetter={higherIsBetter} /> : <span className="text-xs text-muted-foreground">—</span>}
      </div>
    </div>
  );
}

function HeatmapCell({ label, rating, color }: { label: string; rating: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="h-12 w-20 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: color }}>
        {label}
      </div>
      <span className="text-xs text-muted-foreground">{rating}</span>
    </div>
  );
}

function ratingToColor(rating: string): string {
  const r = rating.toLowerCase();
  if (r.includes('extremely high')) return '#EF4444';
  if (r.includes('very high')) return '#F97316';
  if (r.includes('high')) return '#EAB308';
  if (r.includes('significant improvement')) return '#EF4444';
  if (r.includes('improvement needed')) return '#F97316';
  if (r.includes('meets requirement') || r.includes('partially')) return '#EAB308';
  if (r.includes('well controlled') || r.includes('effective')) return '#22C55E';
  if (r.includes('minor') || r.includes('low')) return '#84CC16';
  if (r.includes('medium')) return '#EAB308';
  if (r.includes('negligible')) return '#22C55E';
  return '#6B7280';
}

export function ScenarioBeforeAfterView({ data }: ScenarioBeforeAfterViewProps) {
  const { before, after } = data;

  return (
    <div className="space-y-5">
      {/* Scenario header */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">{data.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{data.description}</p>
          </div>
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {data.auName} ({data.auCode})
          </span>
        </div>
      </div>

      {/* Heatmap color change visualization */}
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Heatmap Color Change
        </p>
        <div className="flex items-center justify-center gap-6">
          <HeatmapCell label="Before" rating={before.residualRiskRating} color={ratingToColor(before.residualRiskRating)} />
          <ArrowRight className="h-6 w-6 text-muted-foreground" />
          <HeatmapCell label="After" rating={after.residualRiskRating} color={ratingToColor(after.residualRiskRating)} />
        </div>
      </div>

      {/* Metrics comparison table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">Before / After Comparison</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{data.auName}</p>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-2 bg-muted/30">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Metric</span>
          <span className="text-xs font-medium text-muted-foreground w-28 text-right">Before</span>
          <span className="text-xs font-medium text-muted-foreground w-28 text-right">After</span>
          <span className="text-xs font-medium text-muted-foreground w-24 text-right">Change</span>
        </div>

        <div className="px-5 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Inherent Risk</p>
          <MetricRow label="IR Score" beforeVal={fmt(before.inherentRiskScore, 0)} afterVal={fmt(after.inherentRiskScore, 0)} higherIsBetter={false} />
          <MetricRow label="IR Rating" beforeVal={before.inherentRiskRating} afterVal={after.inherentRiskRating} higherIsBetter={false} />
        </div>

        <div className="px-5 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Control Environment</p>
          <MetricRow label="CQI Score" beforeVal={fmt(before.cqiScore)} afterVal={fmt(after.cqiScore)} unit="%" higherIsBetter={true} />
          <MetricRow label="CPI Score" beforeVal={fmt(before.cpiScore)} afterVal={fmt(after.cpiScore)} unit="%" higherIsBetter={true} />
          <MetricRow label="CER Score" beforeVal={fmt(before.cerScore)} afterVal={fmt(after.cerScore)} higherIsBetter={true} />
          <MetricRow label="CER Rating" beforeVal={before.cerRating} afterVal={after.cerRating} higherIsBetter={true} />
        </div>

        <div className="px-5 pt-3 pb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Residual Risk</p>
          <MetricRow label="RR Score" beforeVal={fmt(before.residualRiskScore)} afterVal={fmt(after.residualRiskScore)} higherIsBetter={false} />
          <MetricRow label="RR Rating" beforeVal={before.residualRiskRating} afterVal={after.residualRiskRating} higherIsBetter={false} />
          <MetricRow label="Aggregate Residual" beforeVal={fmt(before.aggregateResidual)} afterVal={fmt(after.aggregateResidual)} unit="%" higherIsBetter={false} />
          <MetricRow label="Aggregate Rating" beforeVal={before.aggregateRating} afterVal={after.aggregateRating} higherIsBetter={false} />
        </div>
      </div>
    </div>
  );
}
