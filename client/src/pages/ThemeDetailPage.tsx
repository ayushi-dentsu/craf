import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, ShieldCheck, Layers } from 'lucide-react';
import { useThemeDetail } from '../hooks/useThemes';
import { RiskHeatmap } from '../components/dashboard/RiskHeatmap';
import { cn } from '../lib/utils';

function getRiskColor(score: number) {
  if (score >= 70) return 'text-red-500';
  if (score >= 45) return 'text-orange-500';
  if (score > 5) return 'text-yellow-500';
  if (score > 1) return 'text-lime-500';
  return 'text-green-500';
}

export function ThemeDetailPage() {
  const { themeId } = useParams<{ themeId: string }>();
  const id = Number(themeId);
  const { data, isLoading, error } = useThemeDetail(id);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" role="status">
          <span className="sr-only">Loading theme details…</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load theme data.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="rounded-md p-1 hover:bg-accent" aria-label="Back to dashboard">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-foreground">{data.theme.name}</h1>
          {data.theme.description && (
            <p className="text-sm text-muted-foreground">{data.theme.description}</p>
          )}
        </div>
      </div>

      {/* Theme-level KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Aggregate Residual Risk</p>
            <BarChart3 className={cn('h-5 w-5', getRiskColor(data.aggregateResidualRisk))} />
          </div>
          <p className={cn('mt-2 text-2xl font-bold', getRiskColor(data.aggregateResidualRisk))}>
            {data.aggregateResidualRisk.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground">{data.aggregateRating}</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Control Effectiveness</p>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {data.controlEffectivenessPercent}%
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Assessment Units</p>
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{data.auCount}</p>
        </div>
      </div>

      {/* Filtered heatmap showing only AUs under this theme */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Assessment Units in this Theme</h2>
        <RiskHeatmap data={data.heatmap} />
      </div>
    </div>
  );
}
