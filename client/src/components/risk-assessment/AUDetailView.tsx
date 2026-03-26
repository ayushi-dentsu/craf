import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronDown, ChevronRight, ArrowLeft, TrendingUp, TrendingDown, Minus,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAUDetail } from '../../hooks/useAssessmentUnits';
import { usePeriod } from '../../hooks/usePeriod';
import { LikelihoodBreakdown } from './LikelihoodBreakdown';
import { ImpactBreakdown } from './ImpactBreakdown';
import { cn } from '../../lib/utils';
import type { AUDetailResponse, ObligationDetail } from '../../types';

const CER_COLORS = ['#22C55E', '#84CC16', '#EAB308', '#F97316', '#EF4444'];

function getRatingColor(rating: string) {
  const r = rating.toLowerCase();
  if (r.includes('well controlled') || r.includes('effective') || r.includes('negligible') || r.includes('insignificant')) return 'text-green-600';
  if (r.includes('meets')) return 'text-lime-600';
  if (r.includes('partially') || r.includes('medium') || r.includes('minor')) return 'text-yellow-600';
  if (r.includes('improvement needed') && !r.includes('significant')) return 'text-orange-500';
  return 'text-red-500';
}

function getRatingBadge(rating: string) {
  const r = rating.toLowerCase();
  if (r.includes('well controlled') || r.includes('effective') || r.includes('negligible') || r.includes('insignificant')) return 'bg-green-100 text-green-800';
  if (r.includes('meets')) return 'bg-lime-100 text-lime-800';
  if (r.includes('partially') || r.includes('medium') || r.includes('minor')) return 'bg-yellow-100 text-yellow-800';
  if (r.includes('improvement needed') && !r.includes('significant')) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}

function CollapsibleSection({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-accent/50"
        aria-expanded={open}
      >
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {open && <div className="border-t border-border px-4 py-4">{children}</div>}
    </div>
  );
}

function DistributionDonut({ data, title }: { data: Record<string, number>; title: string }) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  if (entries.length === 0) return <p className="text-xs text-muted-foreground">No data</p>;
  const pieData = entries.map(([name, value]) => ({ name, value }));
  return (
    <div className="text-center">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{title}</p>
      <ResponsiveContainer width={160} height={140}>
        <PieChart>
          <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
            {pieData.map((_, i) => (
              <Cell key={i} fill={CER_COLORS[i % CER_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function DeltaIndicator({ changePct }: { changePct: number | null }) {
  if (changePct === null) return <span className="text-xs text-muted-foreground">No prior data</span>;
  if (changePct > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-500">
        <TrendingUp className="h-3 w-3" /> +{changePct.toFixed(1)}%
      </span>
    );
  }
  if (changePct < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-500">
        <TrendingDown className="h-3 w-3" /> {changePct.toFixed(1)}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Minus className="h-3 w-3" /> No change
    </span>
  );
}

const CRITICALITY_ORDER: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

function ObligationsTable({ obligations }: { obligations: ObligationDetail[] }) {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<'criticality' | 'controlCount'>('criticality');
  const [sortAsc, setSortAsc] = useState(true);
  const [criticalityFilter, setCriticalityFilter] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const filtered = criticalityFilter
    ? obligations.filter((o) => o.criticality === criticalityFilter)
    : obligations;

  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'criticality') {
      const diff = (CRITICALITY_ORDER[a.criticality] ?? 99) - (CRITICALITY_ORDER[b.criticality] ?? 99);
      return sortAsc ? diff : -diff;
    }
    return sortAsc ? a.controlCount - b.controlCount : b.controlCount - a.controlCount;
  });

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <select
          value={criticalityFilter}
          onChange={(e) => setCriticalityFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-2 py-1 text-xs"
          aria-label="Filter by criticality"
        >
          <option value="">All Criticalities</option>
          {['Critical', 'High', 'Medium', 'Low'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="w-8 pb-2" />
            <th className="pb-2">Code</th>
            <th className="pb-2">Description</th>
            <th className="cursor-pointer pb-2" onClick={() => toggleSort('criticality')}>
              Criticality {sortField === 'criticality' ? (sortAsc ? '↑' : '↓') : ''}
            </th>
            <th className="pb-2">Frequency</th>
            <th className="cursor-pointer pb-2 text-right" onClick={() => toggleSort('controlCount')}>
              Controls {sortField === 'controlCount' ? (sortAsc ? '↑' : '↓') : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((ob) => (
            <ObligationRow
              key={ob.id}
              obligation={ob}
              expanded={expandedIds.has(ob.id)}
              onToggle={() => toggleExpand(ob.id)}
              onNavigate={() => navigate(`/dashboard/obligation/${ob.id}`)}
            />
          ))}
          {sorted.length === 0 && (
            <tr><td colSpan={6} className="py-4 text-center text-muted-foreground">No obligations found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ObligationRow({ obligation, expanded, onToggle, onNavigate }: {
  obligation: ObligationDetail;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  return (
    <>
      <tr className="border-b border-border/50 hover:bg-accent/30">
        <td className="py-2">
          {obligation.controls.length > 0 && (
            <button onClick={onToggle} aria-label={expanded ? 'Collapse' : 'Expand'}>
              {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
          )}
        </td>
        <td className="py-2">
          <button onClick={onNavigate} className="text-primary underline-offset-2 hover:underline">
            {obligation.code}
          </button>
        </td>
        <td className="max-w-xs truncate py-2">{obligation.description}</td>
        <td className="py-2">
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', getRatingBadge(obligation.criticality))}>
            {obligation.criticality}
          </span>
        </td>
        <td className="py-2">{obligation.frequency}</td>
        <td className="py-2 text-right">{obligation.controlCount}</td>
      </tr>
      {expanded && obligation.controls.map((ctrl) => (
        <tr key={ctrl.id} className="border-b border-border/30 bg-accent/10">
          <td />
          <td className="py-1.5 pl-4 text-muted-foreground">{ctrl.name}</td>
          <td className="py-1.5 text-muted-foreground">{ctrl.controlType}</td>
          <td className="py-1.5">CQA: {ctrl.cqaScaledScore}</td>
          <td className="py-1.5">CPA: {ctrl.cpaScaledScore}</td>
          <td className="py-1.5 text-right">
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', getRatingBadge(ctrl.residualRiskRating))}>
              {ctrl.residualRiskRating}
            </span>
          </td>
        </tr>
      ))}
    </>
  );
}

export function AUDetailView() {
  const { auId } = useParams<{ auId: string }>();
  const { periodId } = usePeriod();
  const id = Number(auId);
  const { data, isLoading, error } = useAUDetail(id, periodId);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" role="status">
          <span className="sr-only">Loading AU details…</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load assessment unit data.'}
        </p>
      </div>
    );
  }

  const { auInfo, inherentRisk, controlEnvironment, residualRisk, obligations } = data;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="rounded-md p-1 hover:bg-accent" aria-label="Back to dashboard">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-foreground">{auInfo.name}</h1>
          <p className="text-xs text-muted-foreground">
            {auInfo.code} · {auInfo.businessArea} · {auInfo.themeName} · Owner: {auInfo.ownerName}
          </p>
        </div>
      </div>

      {/* Inherent Risk Section */}
      <CollapsibleSection title="Inherent Risk" defaultOpen>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <LikelihoodBreakdown
            parameters={inherentRisk.likelihoodParameters}
            likelihoodScore={inherentRisk.likelihoodScore}
            likelihoodRating={inherentRisk.likelihoodRating}
          />
          <ImpactBreakdown
            parameters={inherentRisk.impactParameters}
            impactScore={inherentRisk.impactScore}
            impactRating={inherentRisk.impactRating}
          />
        </div>
        <div className="mt-4 flex items-center gap-4 rounded-md bg-accent/30 px-4 py-3">
          <span className="text-sm text-muted-foreground">Inherent Risk Score:</span>
          <span className={cn('text-xl font-bold', getRatingColor(inherentRisk.inherentRiskRating))}>
            {inherentRisk.inherentRiskScore}
          </span>
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', getRatingBadge(inherentRisk.inherentRiskRating))}>
            {inherentRisk.inherentRiskRating}
          </span>
        </div>
      </CollapsibleSection>

      {/* Control Environment Section */}
      <CollapsibleSection title="Control Environment">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="text-center">
            <DistributionDonut data={controlEnvironment.cqiDistribution} title="CQI Distribution" />
            <p className="mt-1 text-sm font-semibold">{(controlEnvironment.cqiScore * 100).toFixed(1)}%</p>
            <p className={cn('text-xs', getRatingColor(controlEnvironment.cqiRating))}>{controlEnvironment.cqiRating}</p>
          </div>
          <div className="text-center">
            <DistributionDonut data={controlEnvironment.cpiDistribution} title="CPI Distribution" />
            <p className="mt-1 text-sm font-semibold">{(controlEnvironment.cpiScore * 100).toFixed(1)}%</p>
            <p className={cn('text-xs', getRatingColor(controlEnvironment.cpiRating))}>{controlEnvironment.cpiRating}</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-md bg-accent/30 p-4">
            <p className="text-xs text-muted-foreground">CER Score</p>
            <p className="text-2xl font-bold text-foreground">{controlEnvironment.cerScore.toFixed(1)}</p>
            <span className={cn('mt-1 rounded-full px-2 py-0.5 text-xs font-medium', getRatingBadge(controlEnvironment.cerRating))}>
              {controlEnvironment.cerRating}
            </span>
          </div>
        </div>
      </CollapsibleSection>

      {/* Residual Risk Section */}
      <CollapsibleSection title="Residual Risk">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Residual Risk Score</p>
            <p className={cn('text-2xl font-bold', getRatingColor(residualRisk.residualRiskRating))}>
              {residualRisk.residualRiskScore.toFixed(2)}
            </p>
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', getRatingBadge(residualRisk.residualRiskRating))}>
              {residualRisk.residualRiskRating}
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Aggregate Residual</p>
            <p className="text-2xl font-bold text-foreground">{residualRisk.aggregateResidual.toFixed(1)}%</p>
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', getRatingBadge(residualRisk.aggregateRating))}>
              {residualRisk.aggregateRating}
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">vs Previous Period</p>
            {residualRisk.previousPeriodScore !== null ? (
              <p className="text-sm text-muted-foreground">
                Previous: {residualRisk.previousPeriodScore.toFixed(2)}
              </p>
            ) : null}
            <DeltaIndicator changePct={residualRisk.changePct} />
          </div>
        </div>
      </CollapsibleSection>

      {/* Obligations Table */}
      <CollapsibleSection title={`Obligations (${obligations.length})`} defaultOpen>
        <ObligationsTable obligations={obligations} />
      </CollapsibleSection>
    </div>
  );
}
