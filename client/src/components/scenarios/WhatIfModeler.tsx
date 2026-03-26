import { useState } from 'react';
import { cn } from '../../lib/utils';
import type { WhatIfRegulationScenario, WhatIfAU, WhatIfScenarioOutcome } from '../../services/scenarios.service';

interface WhatIfModelerProps {
  data: WhatIfRegulationScenario;
}

function ratingToColor(rating: string): string {
  const r = rating.toLowerCase();
  if (r.includes('extremely high')) return '#EF4444';
  if (r.includes('very high')) return '#F97316';
  if (r.includes('high') && !r.includes('negligible')) return '#EAB308';
  if (r.includes('significant improvement')) return '#EF4444';
  if (r.includes('improvement needed')) return '#F97316';
  if (r.includes('meets requirement') || r.includes('partially')) return '#EAB308';
  if (r.includes('well controlled') || r.includes('effective')) return '#22C55E';
  if (r.includes('medium')) return '#EAB308';
  if (r.includes('low')) return '#84CC16';
  if (r.includes('negligible')) return '#22C55E';
  return '#6B7280';
}

function strategyLabel(strategy: string): string {
  switch (strategy) {
    case 'none': return 'No Controls';
    case 'basic': return 'Basic Controls';
    case 'comprehensive': return 'Comprehensive Controls';
    default: return strategy;
  }
}

function ScenarioOutcomeCard({ outcome, isSelected }: { outcome: WhatIfScenarioOutcome; isSelected: boolean }) {
  return (
    <div className={cn(
      'rounded-lg border p-4 transition-all',
      isSelected ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-border bg-card',
    )}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-foreground">{outcome.scenarioLabel}</p>
        <span className="rounded-full px-2 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: ratingToColor(outcome.aggregateRating) }}>
          {outcome.aggregateRating}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{outcome.description}</p>
      <p className="text-xs text-muted-foreground mb-3">
        Strategy: <span className="font-medium text-foreground">{strategyLabel(outcome.controlStrategy)}</span>
      </p>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">CQI Score</span>
          <span className="text-xs font-bold">{outcome.cqiScore.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">CPI Score</span>
          <span className="text-xs font-bold">{outcome.cpiScore.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">CER Score</span>
          <span className="text-xs font-bold">{outcome.cerScore}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">CER Rating</span>
          <span className="text-xs font-medium" style={{ color: ratingToColor(outcome.cerRating) }}>{outcome.cerRating}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2">
          <span className="text-xs text-muted-foreground">Residual Risk</span>
          <span className="text-xs font-bold" style={{ color: ratingToColor(outcome.residualRiskRating) }}>
            {outcome.residualRiskScore.toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">RR Rating</span>
          <span className="text-xs font-medium" style={{ color: ratingToColor(outcome.residualRiskRating) }}>
            {outcome.residualRiskRating}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">Aggregate Residual</span>
          <span className="text-xs font-bold">{outcome.aggregateResidual.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

function AUSection({ au, selectedScenario, onSelectScenario }: {
  au: WhatIfAU;
  selectedScenario: number;
  onSelectScenario: (idx: number) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground">{au.auName} ({au.auCode})</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Current IR: {au.currentInherentRiskScore} · New obligations: {au.newObligationCount}
            </p>
          </div>
        </div>
      </div>

      {/* Scenario toggle */}
      <div className="flex border-b border-border">
        {au.scenarios.map((s, i) => (
          <button
            key={s.scenarioLabel}
            onClick={() => onSelectScenario(i)}
            className={cn(
              'flex-1 px-3 py-2 text-xs font-medium transition-colors',
              selectedScenario === i
                ? 'bg-primary/10 text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:bg-accent/50',
            )}
          >
            {s.scenarioLabel}: {strategyLabel(s.controlStrategy)}
          </button>
        ))}
      </div>

      {/* 3 scenario cards side by side */}
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
        {au.scenarios.map((s, i) => (
          <button key={s.scenarioLabel} onClick={() => onSelectScenario(i)} className="text-left">
            <ScenarioOutcomeCard outcome={s} isSelected={selectedScenario === i} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function WhatIfModeler({ data }: WhatIfModelerProps) {
  const [selectedScenarios, setSelectedScenarios] = useState<Record<string, number>>({});

  const getSelected = (auCode: string) => selectedScenarios[auCode] ?? 0;
  const setSelected = (auCode: string, idx: number) =>
    setSelectedScenarios((prev) => ({ ...prev, [auCode]: idx }));

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
            {data.totalNewObligations} new obligations
          </span>
        </div>
        <div className="mt-3 rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2">
          <p className="text-xs font-medium text-yellow-800">
            Regulation: {data.regulationName} — Affecting {data.affectedAUs.length} Assessment Units
          </p>
        </div>
      </div>

      {/* Summary: 3 scenarios overview */}
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          What-If Scenarios Overview
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {['No Controls', 'Basic Controls', 'Comprehensive Controls'].map((label, i) => {
            const strategy = ['none', 'basic', 'comprehensive'][i];
            // Aggregate across all AUs for this strategy
            const outcomes = data.affectedAUs.map((au) => au.scenarios[i]).filter(Boolean);
            const avgRR = outcomes.length > 0
              ? outcomes.reduce((sum, o) => sum + o.residualRiskScore, 0) / outcomes.length
              : 0;
            const worstRating = outcomes.length > 0
              ? outcomes.reduce((worst, o) => {
                  const order = ['Well Controlled', 'Meets Requirement', 'Improvement Needed', 'Significant Improvement Needed', 'No Control'];
                  return order.indexOf(o.residualRiskRating) > order.indexOf(worst) ? o.residualRiskRating : worst;
                }, outcomes[0].residualRiskRating)
              : 'N/A';

            return (
              <div key={label} className="rounded-lg border border-border p-4 text-center">
                <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
                <p className="text-xs text-muted-foreground mb-2">Strategy: {strategy}</p>
                <div className="rounded-full mx-auto w-fit px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: ratingToColor(worstRating) }}>
                  {worstRating}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Avg RR: {avgRR.toFixed(1)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-AU detailed breakdown */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Detailed Projections by Assessment Unit
        </p>
        <div className="space-y-4">
          {data.affectedAUs.map((au) => (
            <AUSection
              key={au.auCode}
              au={au}
              selectedScenario={getSelected(au.auCode)}
              onSelectScenario={(idx) => setSelected(au.auCode, idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
