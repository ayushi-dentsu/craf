import { TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, BarChart3 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface KPICardsProps {
  overallResidualRiskScore: number;
  highCriticalRisksCount: number;
  controlEffectivenessPercent: number;
  complianceBreachTrend: number[];
}

function getRiskColor(score: number) {
  if (score >= 70) return 'text-red-500';
  if (score >= 45) return 'text-orange-500';
  if (score > 5) return 'text-yellow-500';
  if (score > 1) return 'text-lime-500';
  return 'text-green-500';
}

function getRiskBg(score: number) {
  if (score >= 70) return 'bg-red-50 border-red-200';
  if (score >= 45) return 'bg-orange-50 border-orange-200';
  if (score > 5) return 'bg-yellow-50 border-yellow-200';
  if (score > 1) return 'bg-lime-50 border-lime-200';
  return 'bg-green-50 border-green-200';
}

/** Tiny inline sparkline rendered as SVG */
function Sparkline({ data, className }: { data: number[]; className?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(' ');

  const trending = data[data.length - 1] > data[0];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn('h-7 w-20', className)}
      role="img"
      aria-label={`Trend: ${trending ? 'increasing' : 'decreasing'}`}
    >
      <polyline
        points={points}
        fill="none"
        stroke={trending ? '#EF4444' : '#22C55E'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Circular gauge for percentage values */
function CircularGauge({ percent }: { percent: number }) {
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;
  const color = percent >= 80 ? '#22C55E' : percent >= 60 ? '#84CC16' : percent >= 40 ? '#EAB308' : '#EF4444';

  return (
    <svg viewBox="0 0 72 72" className="h-16 w-16" role="img" aria-label={`${percent}% effective`}>
      <circle cx="36" cy="36" r={r} fill="none" stroke="#E5E7EB" strokeWidth="6" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
      />
      <text x="36" y="40" textAnchor="middle" className="fill-foreground text-xs font-semibold">
        {percent}%
      </text>
    </svg>
  );
}

export function KPICards({ overallResidualRiskScore, highCriticalRisksCount, controlEffectivenessPercent, complianceBreachTrend }: KPICardsProps) {
  const breachTrending =
    complianceBreachTrend.length >= 2
      ? complianceBreachTrend[complianceBreachTrend.length - 1] > complianceBreachTrend[0]
      : false;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Overall Residual Risk Score */}
      <div className={cn('rounded-lg border p-4', getRiskBg(overallResidualRiskScore))}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">Overall Residual Risk</p>
          <BarChart3 className={cn('h-5 w-5', getRiskColor(overallResidualRiskScore))} />
        </div>
        <p className={cn('mt-2 text-3xl font-bold', getRiskColor(overallResidualRiskScore))}>
          {overallResidualRiskScore.toFixed(1)}%
        </p>
      </div>

      {/* High/Critical Risks Count */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">High / Critical Risks</p>
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-3xl font-bold text-foreground">{highCriticalRisksCount}</p>
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
            Needs Attention
          </span>
        </div>
      </div>

      {/* Control Effectiveness */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">Control Effectiveness</p>
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <div className="mt-1 flex items-center gap-3">
          <CircularGauge percent={controlEffectivenessPercent} />
          <p className="text-sm text-muted-foreground">
            {controlEffectivenessPercent >= 80 ? 'Strong' : controlEffectivenessPercent >= 60 ? 'Adequate' : 'Weak'}
          </p>
        </div>
      </div>

      {/* Compliance Breach Trend */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">Compliance Breach Trend</p>
          {breachTrending ? (
            <TrendingUp className="h-5 w-5 text-red-500" />
          ) : (
            <TrendingDown className="h-5 w-5 text-green-500" />
          )}
        </div>
        <div className="mt-2 flex items-center gap-3">
          <Sparkline data={complianceBreachTrend} />
          <p className="text-sm text-muted-foreground">
            {complianceBreachTrend.length > 0 ? complianceBreachTrend[complianceBreachTrend.length - 1] : 0} breaches
          </p>
        </div>
      </div>
    </div>
  );
}
