import { AlertTriangle, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { cn } from '../../lib/utils';
import type { ControlDegradationScenario } from '../../services/scenarios.service';

interface ScenarioDegradationViewProps {
  data: ControlDegradationScenario;
}

function ratingToColor(rating: string): string {
  const r = rating.toLowerCase();
  if (r.includes('significant improvement')) return 'text-red-600';
  if (r.includes('improvement needed')) return 'text-orange-600';
  if (r.includes('meets requirement') || r.includes('partially')) return 'text-yellow-600';
  if (r.includes('well controlled') || r.includes('effective')) return 'text-green-600';
  return 'text-muted-foreground';
}

function ratingToBgColor(rating: string): string {
  const r = rating.toLowerCase();
  if (r.includes('significant improvement')) return 'bg-red-50 border-red-200';
  if (r.includes('improvement needed')) return 'bg-orange-50 border-orange-200';
  if (r.includes('meets requirement') || r.includes('partially')) return 'bg-yellow-50 border-yellow-200';
  if (r.includes('well controlled') || r.includes('effective')) return 'bg-green-50 border-green-200';
  return 'bg-muted/30';
}

export function ScenarioDegradationView({ data }: ScenarioDegradationViewProps) {
  const { degradationPattern } = data;

  if (degradationPattern.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">No degradation data available.</p>
      </div>
    );
  }

  const first = degradationPattern[0];
  const last = degradationPattern[degradationPattern.length - 1];

  // Build chart data
  const chartData = degradationPattern.map((p) => ({
    month: p.month.replace(/\s*\(.*\)/, ''),
    'CPA Score': p.cpaScaledScore,
    'CPI %': Math.round(p.cpiScore * 100) / 100,
    'CER Score': p.cerScore,
    'Residual Risk': Math.round(p.residualRiskScore * 100) / 100,
  }));

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
        <div className="mt-3 rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2">
          <p className="text-xs font-medium text-yellow-800">
            Control: {data.controlName} ({data.controlCode}) — 3-month degradation pattern
          </p>
        </div>
      </div>

      {/* Early Warning Panel */}
      <div className="rounded-lg border border-red-200 bg-red-50">
        <div className="border-b border-red-200 px-4 py-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <h2 className="text-sm font-semibold text-red-800">
            Early Warning Triggered
          </h2>
          <span className="ml-auto h-2.5 w-2.5 rounded-full bg-red-500" />
        </div>
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-900">{data.auName}</p>
              <p className="text-xs text-red-700 mt-0.5">
                CPA degraded from {first.cpaScaledScore} → {last.cpaScaledScore} over {degradationPattern.length} months.
                CPI dropped from {(first.cpiScore).toFixed(1)}% → {(last.cpiScore).toFixed(1)}%.
                Residual risk increased from {first.residualRiskScore.toFixed(1)} → {last.residualRiskScore.toFixed(1)}.
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-red-600 font-medium">Approaching Failure</span>
                <span className="text-xs text-red-600">Severity: Red</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Degradation Trend Chart */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Degradation Trend</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="CPA Score" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="CPI %" stroke="#F97316" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="CER Score" stroke="#EAB308" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Residual Risk" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Month-by-month breakdown */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">Month-by-Month Breakdown</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-3">
          {degradationPattern.map((point, i) => (
            <div
              key={point.month}
              className={cn(
                'rounded-lg border p-4',
                ratingToBgColor(point.residualRiskRating),
              )}
            >
              <p className="text-xs font-semibold text-muted-foreground mb-3">{point.month}</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">CPA Raw</span>
                  <span className="text-xs font-bold">{point.cpaRawScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">CPA Scaled</span>
                  <span className="text-xs font-bold">{point.cpaScaledScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">CPI</span>
                  <span className="text-xs font-bold">{point.cpiScore.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">CER</span>
                  <span className="text-xs font-bold">{point.cerScore}</span>
                </div>
                <div className="flex justify-between border-t border-border/50 pt-2">
                  <span className="text-xs text-muted-foreground">Residual Risk</span>
                  <span className={cn('text-xs font-bold', ratingToColor(point.residualRiskRating))}>
                    {point.residualRiskScore.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Rating</span>
                  <span className={cn('text-xs font-medium', ratingToColor(point.residualRiskRating))}>
                    {point.residualRiskRating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
