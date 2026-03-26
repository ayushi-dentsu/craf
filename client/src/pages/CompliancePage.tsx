import { RBIComplianceDashboard } from '../components/compliance/RBIComplianceDashboard';
import { useComplianceDashboard } from '../hooks/useCompliance';
import { usePeriod } from '../hooks/usePeriod';

export function CompliancePage() {
  const { periodId } = usePeriod();
  const { data, isLoading, error } = useComplianceDashboard(periodId);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" role="status">
          <span className="sr-only">Loading…</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive">Failed to load compliance data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-foreground">RBI Compliance Dashboard</h1>
      <RBIComplianceDashboard data={data as Parameters<typeof RBIComplianceDashboard>[0]['data']} />
    </div>
  );
}
