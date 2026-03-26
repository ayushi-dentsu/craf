import { useNavigate } from 'react-router-dom';
import { AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import { useEarlyWarnings } from '../../hooks/useRiskData';
import { cn } from '../../lib/utils';
import type { EarlyWarningEntry } from '../../types';

const SEVERITY_STYLES: Record<string, string> = {
  red: 'border-red-200 bg-red-50',
  amber: 'border-amber-200 bg-amber-50',
  green: 'border-green-200 bg-green-50',
};

function WarningIcon({ type }: { type: string }) {
  switch (type) {
    case 'deteriorating_risk':
      return <AlertTriangle className="h-4 w-4 text-amber-500" aria-label="Deteriorating risk" />;
    case 'approaching_failure':
      return <XCircle className="h-4 w-4 text-red-500" aria-label="Approaching failure" />;
    case 'breach_trend':
      return <TrendingUp className="h-4 w-4 text-red-500" aria-label="Breach trend" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
  }
}

function WarningTypeLabel({ type }: { type: string }) {
  switch (type) {
    case 'deteriorating_risk': return 'Deteriorating Risk';
    case 'approaching_failure': return 'Approaching Failure';
    case 'breach_trend': return 'Breach Trend';
    default: return type;
  }
}

export function EarlyWarningPanel() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useEarlyWarnings();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Early Warnings</h2>
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" role="status">
            <span className="sr-only">Loading warnings…</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Early Warnings</h2>
        <p className="text-xs text-destructive">Failed to load early warnings.</p>
      </div>
    );
  }

  const warnings = (data as EarlyWarningEntry[] | undefined) ?? [];

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">
          Early Warnings {warnings.length > 0 && (
            <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">{warnings.length}</span>
          )}
        </h2>
      </div>

      {warnings.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">No active warnings. All clear.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {warnings.map((w, i) => (
            <li key={`${w.auId}-${w.type}-${i}`}>
              <button
                onClick={() => navigate(`/dashboard/au/${w.auId}`)}
                className={cn(
                  'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50',
                  SEVERITY_STYLES[w.severity] ?? '',
                )}
              >
                <WarningIcon type={w.type} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{w.auName}</p>
                  <p className="text-xs text-muted-foreground">{w.businessArea}</p>
                  <p className="mt-0.5 text-xs text-foreground">{w.message}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      <WarningTypeLabel type={w.type} />
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Value: {w.value.toFixed(1)} / Threshold: {w.threshold.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className={cn(
                  'mt-1 h-2.5 w-2.5 shrink-0 rounded-full',
                  w.severity === 'red' ? 'bg-red-500' : w.severity === 'amber' ? 'bg-amber-500' : 'bg-green-500',
                )} aria-label={`Severity: ${w.severity}`} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
