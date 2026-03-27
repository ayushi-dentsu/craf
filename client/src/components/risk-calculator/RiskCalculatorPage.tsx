import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calculator, ChevronDown, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  getControlsForAU,
  getInherentRisk,
  getControlEnvironment,
  getResidualRisk,
  saveCQA,
  saveCPA,
  type ControlWithAssessments,
} from '../../services/risk-calculator.service';
import { listAssessmentUnits } from '../../services/assessment-units.service';

// ── Score option helpers ──

const SCORE_135 = [
  { value: 1, label: '1 — Low' },
  { value: 3, label: '3 — Medium' },
  { value: 5, label: '5 — High' },
];
const SCORE_15 = [
  { value: 1, label: '1 — No' },
  { value: 5, label: '5 — Yes' },
];

function ScoreSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number;
  options: { value: number; label: string }[];
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ── CQA Editor ──

function CQAEditor({ control, periodId, onSaved }: {
  control: ControlWithAssessments;
  periodId: number;
  onSaved: () => void;
}) {
  const existing = control.qualityAssessments?.[0];
  const [monitoring, setMonitoring] = useState(existing?.monitoringScore ?? 1);
  const [automation, setAutomation] = useState(existing?.automationScore ?? 1);
  const [type, setType] = useState(existing?.typeScore ?? 1);
  const [documentation, setDocumentation] = useState(existing?.documentationScore ?? 1);

  const mutation = useMutation({
    mutationFn: () => saveCQA(control.id, { periodId, monitoringScore: monitoring, automationScore: automation, typeScore: type, documentationScore: documentation }),
    onSuccess: onSaved,
  });

  const raw = monitoring * automation * type * documentation;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ScoreSelect label="Monitoring" value={monitoring} options={SCORE_135} onChange={setMonitoring} />
        <ScoreSelect label="Automation" value={automation} options={SCORE_135} onChange={setAutomation} />
        <ScoreSelect label="Type (Prev/Det)" value={type} options={SCORE_135} onChange={setType} />
        <ScoreSelect label="Documented" value={documentation} options={SCORE_15} onChange={setDocumentation} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground">Raw: {raw}</span>
        {existing && (
          <span className="text-xs text-muted-foreground">
            Current: {existing.cqaScaledScore} ({existing.controlCategory})
          </span>
        )}
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="ml-auto rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving…' : 'Save CQA'}
        </button>
      </div>
      {mutation.isError && (
        <p className="text-xs text-destructive">Error: {(mutation.error as Error).message}</p>
      )}
      {mutation.isSuccess && (
        <p className="text-xs text-green-600">CQA saved — pipeline recalculated.</p>
      )}
    </div>
  );
}

// ── CPA Editor ──

function CPAEditor({ control, periodId, onSaved }: {
  control: ControlWithAssessments;
  periodId: number;
  onSaved: () => void;
}) {
  const existing = control.performanceAssessments?.[0];
  const [riskType, setRiskType] = useState(existing?.controlRiskType ?? 'Compliance');
  const [kciLinked, setKciLinked] = useState(existing?.kciLinked ?? true);
  const [kciResult, setKciResult] = useState<string | null>(existing?.kciResult ?? 'Pass');
  const [saResult, setSaResult] = useState(existing?.selfAssessmentResult ?? 'Pass');
  const [testResult, setTestResult] = useState(existing?.controlTestingResult ?? 'Pass');

  const mutation = useMutation({
    mutationFn: () => saveCPA(control.id, {
      periodId,
      controlRiskType: riskType,
      kciLinked,
      kciResult: kciLinked ? kciResult : null,
      selfAssessmentResult: saResult,
      controlTestingResult: testResult,
    }),
    onSuccess: onSaved,
  });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Risk Type</label>
          <select value={riskType} onChange={(e) => setRiskType(e.target.value)} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm">
            <option value="Compliance">Compliance</option>
            <option value="ICOFR">ICOFR</option>
            <option value="Converged">Converged</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">KCI Linked</label>
          <select value={kciLinked ? 'yes' : 'no'} onChange={(e) => setKciLinked(e.target.value === 'yes')} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm">
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        {kciLinked && (
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">KCI Result</label>
            <select value={kciResult ?? 'Pass'} onChange={(e) => setKciResult(e.target.value)} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm">
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
            </select>
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Self-Assessment</label>
          <select value={saResult} onChange={(e) => setSaResult(e.target.value)} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm">
            <option value="Pass">Pass</option>
            <option value="Pass with Exception">Pass w/ Exception</option>
            <option value="Fail">Fail</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Testing Result</label>
          <select value={testResult} onChange={(e) => setTestResult(e.target.value)} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm">
            <option value="Pass">Pass</option>
            <option value="Pass with Exception">Pass w/ Exception</option>
            <option value="Fail">Fail</option>
            <option value="Not Tested">Not Tested</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {existing && (
          <span className="text-xs text-muted-foreground">
            Current: {existing.cpaScaledScore} ({existing.performanceCategory})
          </span>
        )}
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="ml-auto rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving…' : 'Save CPA'}
        </button>
      </div>
      {mutation.isError && (
        <p className="text-xs text-destructive">Error: {(mutation.error as Error).message}</p>
      )}
      {mutation.isSuccess && (
        <p className="text-xs text-green-600">CPA saved — pipeline recalculated.</p>
      )}
    </div>
  );
}

// ── Control Row (expandable) ──

function ControlRow({ control, periodId, onSaved }: {
  control: ControlWithAssessments;
  periodId: number;
  onSaved: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cqa = control.qualityAssessments?.[0];
  const cpa = control.performanceAssessments?.[0];

  return (
    <div className="border border-border rounded-lg">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/20"
      >
        <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', expanded && 'rotate-180')} />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground">{control.code}</span>
          <span className="ml-2 text-sm text-muted-foreground">{control.name}</span>
        </div>
        <div className="flex gap-3 text-xs">
          <span className={cn('rounded-full px-2 py-0.5', cqa ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-muted text-muted-foreground')}>
            CQA: {cqa ? cqa.cqaScaledScore : '—'}
          </span>
          <span className={cn('rounded-full px-2 py-0.5', cpa ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 'bg-muted text-muted-foreground')}>
            CPA: {cpa ? cpa.cpaScaledScore : '—'}
          </span>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Control Quality (CQA)</h4>
            <CQAEditor control={control} periodId={periodId} onSaved={onSaved} />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Control Performance (CPA)</h4>
            <CPAEditor control={control} periodId={periodId} onSaved={onSaved} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Result Card ──

function ResultCard({ label, value, sublabel, color }: {
  label: string;
  value: string | number;
  sublabel?: string;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-lg font-bold mt-0.5', color ?? 'text-foreground')}>{value}</p>
      {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
    </div>
  );
}

// ── Main Page ──

export function RiskCalculatorPage() {
  const [selectedAuId, setSelectedAuId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: aus, isLoading: ausLoading, error: ausError } = useQuery({
    queryKey: ['assessment-units'],
    queryFn: () => listAssessmentUnits(),
  });

  const { data: controls, isLoading: controlsLoading } = useQuery({
    queryKey: ['controls', selectedAuId],
    queryFn: () => getControlsForAU(selectedAuId!),
    enabled: !!selectedAuId,
  });

  const { data: ir } = useQuery({
    queryKey: ['inherent-risk', selectedAuId],
    queryFn: () => getInherentRisk(selectedAuId!),
    enabled: !!selectedAuId,
  });

  const { data: ce } = useQuery({
    queryKey: ['control-environment', selectedAuId],
    queryFn: () => getControlEnvironment(selectedAuId!),
    enabled: !!selectedAuId,
  });

  const { data: rr } = useQuery({
    queryKey: ['residual-risk', selectedAuId],
    queryFn: () => getResidualRisk(selectedAuId!),
    enabled: !!selectedAuId,
  });

  const periodId = (ir as any)?.periodId ?? (ce as any)?.periodId ?? 2;

  function invalidateAll() {
    queryClient.refetchQueries({ queryKey: ['controls'] });
    queryClient.refetchQueries({ queryKey: ['control-environment'] });
    queryClient.refetchQueries({ queryKey: ['residual-risk'] });
    queryClient.refetchQueries({ queryKey: ['inherent-risk'] });
  }

  const irData = ir as any;
  const ceData = ce as any;
  const rrData = rr as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold text-foreground">Risk Calculator</h1>
      </div>

      {/* AU Selector */}
      <div className="rounded-lg border border-border bg-card p-4">
        <label className="block text-sm font-medium text-foreground mb-2">Select Assessment Unit</label>
        {ausLoading && <p className="text-sm text-muted-foreground">Loading assessment units…</p>}
        {ausError && (
          <p className="text-sm text-destructive mb-2">
            Failed to load assessment units: {(ausError as Error).message}
          </p>
        )}
        <select
          value={selectedAuId ?? ''}
          onChange={(e) => setSelectedAuId(e.target.value ? Number(e.target.value) : null)}
          className="w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">— Choose an AU —</option>
          {Array.isArray(aus) && aus.map((au: any) => (
            <option key={au.id} value={au.id}>{au.code} — {au.name}</option>
          ))}
        </select>
      </div>

      {selectedAuId && (
        <>
          {/* Current Results Summary */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Current Risk Profile</h2>
              <button onClick={invalidateAll} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <ResultCard label="Inherent Risk" value={irData?.inherentRiskScore ?? '—'} sublabel={irData?.inherentRiskRating} />
              <ResultCard label="CQI Score" value={ceData?.cer?.cqiInterpScore ?? '—'} sublabel={`Weighted: ${ceData?.cer?.cqiScore?.toFixed(2) ?? '—'}`} />
              <ResultCard label="CPI Score" value={ceData?.cer?.cpiInterpScore ?? '—'} sublabel={`Weighted: ${ceData?.cer?.cpiScore?.toFixed(2) ?? '—'}`} />
              <ResultCard label="CER" value={ceData?.cer?.cerScore?.toFixed(2) ?? '—'} sublabel={ceData?.cer?.cerRating} color="text-primary" />
              <ResultCard label="Residual Risk" value={typeof rrData?.residualRiskScore === 'number' ? rrData.residualRiskScore.toFixed(2) : '—'} sublabel={rrData?.residualRiskRating} />
              <ResultCard label="Aggregate" value={typeof rrData?.aggregateResidual === 'number' ? rrData.aggregateResidual.toFixed(4) : '—'} sublabel={rrData?.aggregateRating} />
            </div>
          </div>

          {/* Controls List */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Controls ({controls?.length ?? 0})
            </h2>
            {controlsLoading && <p className="text-sm text-muted-foreground">Loading controls…</p>}
            <div className="space-y-2">
              {(controls as ControlWithAssessments[] | undefined)?.map((ctrl) => (
                <ControlRow key={ctrl.id} control={ctrl} periodId={periodId} onSaved={invalidateAll} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
