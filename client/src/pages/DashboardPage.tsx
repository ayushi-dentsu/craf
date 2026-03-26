import { useState } from 'react';
import { KPICards } from '../components/dashboard/KPICards';
import { RiskHeatmap } from '../components/dashboard/RiskHeatmap';
import { TrendCharts } from '../components/dashboard/TrendCharts';
import { useDashboard } from '../hooks/useDashboard';

export function DashboardPage() {
  const [viewMode, setViewMode] = useState<'realtime' | 'periodic'>('periodic');
  const { data, isLoading, error } = useDashboard(undefined, viewMode);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" role="status">
          <span className="sr-only">Loading dashboard…</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load dashboard data.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title + view toggle */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Executive Dashboard</h1>
        <div className="flex rounded-md border border-input text-sm">
          <button
            onClick={() => setViewMode('realtime')}
            className={`px-3 py-1.5 ${viewMode === 'realtime' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
          >
            Realtime
          </button>
          <button
            onClick={() => setViewMode('periodic')}
            className={`px-3 py-1.5 ${viewMode === 'periodic' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
          >
            Periodic
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards
        overallResidualRiskScore={data.kpis.overallResidualRiskScore}
        highCriticalRisksCount={data.kpis.highCriticalRisksCount}
        controlEffectivenessPercent={data.kpis.controlEffectivenessPercent}
        complianceBreachTrend={data.kpis.complianceBreachTrend}
      />

      {/* Risk Heatmap */}
      <RiskHeatmap data={data.heatmap} />

      {/* Trend Charts */}
      <TrendCharts
        trends={data.trends}
        riskDistributionByTheme={data.riskDistributionByTheme}
        controlsByEffectiveness={data.controlsByEffectiveness}
      />
    </div>
  );
}
