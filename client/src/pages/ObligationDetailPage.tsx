import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useObligationDetail } from '../hooks/useObligations';
import { usePeriod } from '../hooks/usePeriod';
import { cn } from '../lib/utils';

function getRatingBadge(rating: string) {
  const r = rating.toLowerCase();
  if (r.includes('well controlled') || r.includes('effective') || r.includes('negligible') || r.includes('insignificant')) return 'bg-green-100 text-green-800';
  if (r.includes('meets')) return 'bg-lime-100 text-lime-800';
  if (r.includes('partially') || r.includes('medium') || r.includes('minor')) return 'bg-yellow-100 text-yellow-800';
  if (r.includes('improvement needed') && !r.includes('significant')) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}

function getScoreColor(score: number) {
  if (score >= 25) return 'text-green-600';
  if (score >= 15) return 'text-lime-600';
  if (score >= 10) return 'text-yellow-600';
  return 'text-red-500';
}

export function ObligationDetailPage() {
  const { obligationId } = useParams<{ obligationId: string }>();
  const navigate = useNavigate();
  const { periodId } = usePeriod();
  const id = Number(obligationId);
  const { data, isLoading, error } = useObligationDetail(id, periodId);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" role="status">
          <span className="sr-only">Loading obligation details…</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load obligation data.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="rounded-md p-1 hover:bg-accent" aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">{data.code}</h1>
          <p className="text-sm text-muted-foreground">{data.auName} · {data.themeName}</p>
        </div>
      </div>

      {/* Obligation Info Card */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Obligation Details</h2>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Description</dt>
            <dd className="text-foreground">{data.description}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Regulation Source</dt>
            <dd className="text-foreground">{data.regulationSource}</dd>
          </div>
          {data.regulationName && (
            <div>
              <dt className="text-xs text-muted-foreground">Regulation Name</dt>
              <dd className="text-foreground">{data.regulationName}</dd>
            </div>
          )}
          {data.regulationRef && (
            <div>
              <dt className="text-xs text-muted-foreground">Reference</dt>
              <dd className="text-foreground">{data.regulationRef}</dd>
            </div>
          )}
          {data.referenceParagraph && (
            <div>
              <dt className="text-xs text-muted-foreground">Paragraph</dt>
              <dd className="text-foreground">{data.referenceParagraph}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-muted-foreground">Frequency</dt>
            <dd className="text-foreground">{data.frequency ?? 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Criticality</dt>
            <dd>
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', getRatingBadge(data.criticality ?? 'Medium'))}>
                {data.criticality ?? 'N/A'}
              </span>
            </dd>
          </div>
          {data.ownerWithinAU && (
            <div>
              <dt className="text-xs text-muted-foreground">Owner</dt>
              <dd className="text-foreground">{data.ownerWithinAU}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Controls Table */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Associated Controls ({data.controls.length})
        </h2>
        {data.controls.length === 0 ? (
          <p className="text-sm text-muted-foreground">No controls mapped to this obligation.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2">Code</th>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Nature</th>
                  <th className="pb-2 text-center">Documented</th>
                  <th className="pb-2 text-right">CQA</th>
                  <th className="pb-2 text-right">CPA</th>
                  <th className="pb-2 text-right">Residual Risk</th>
                </tr>
              </thead>
              <tbody>
                {data.controls.map((ctrl) => (
                  <tr key={ctrl.id} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="py-2 font-medium">{ctrl.code}</td>
                    <td className="max-w-xs truncate py-2">{ctrl.name}</td>
                    <td className="py-2">{ctrl.controlType}</td>
                    <td className="py-2">{ctrl.controlNature}</td>
                    <td className="py-2 text-center">{ctrl.isDocumented ? '✓' : '✗'}</td>
                    <td className={cn('py-2 text-right font-medium', getScoreColor(ctrl.cqaScaledScore))}>
                      {ctrl.cqaScaledScore}
                      <span className="ml-1 text-muted-foreground">({ctrl.cqaCategory})</span>
                    </td>
                    <td className={cn('py-2 text-right font-medium', getScoreColor(ctrl.cpaScaledScore))}>
                      {ctrl.cpaScaledScore}
                      <span className="ml-1 text-muted-foreground">({ctrl.cpaCategory})</span>
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-medium">{ctrl.residualRiskScore.toFixed(2)}</span>
                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', getRatingBadge(ctrl.residualRiskRating))}>
                          {ctrl.residualRiskRating}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
