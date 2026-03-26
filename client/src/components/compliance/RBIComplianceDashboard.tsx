import { AlertCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '../../lib/utils';

interface RegulatoryReturnStatus {
  auId: number;
  auName: string;
  regulatoryReturnsScore: number;
  returnsCount: number;
  status: 'Compliant' | 'At Risk' | 'Non-Compliant';
}

interface BreachEntry {
  auId: number;
  auName: string;
  breachScore: number;
  periodName: string;
}

interface DeadlineEntry {
  obligationId: number;
  obligationCode: string;
  description: string;
  frequency: string;
  auName: string;
}

interface ComplianceDashboardData {
  overallComplianceScore: number;
  totalObligations: number;
  compliantObligations: number;
  regulatoryReturnsStatus: RegulatoryReturnStatus[];
  recentBreaches: BreachEntry[];
  upcomingDeadlines: DeadlineEntry[];
  complianceTrend: { labels: string[]; scores: number[] };
}

interface RBIComplianceDashboardProps {
  data: ComplianceDashboardData;
}

/** Circular gauge for compliance score */
function ComplianceGauge({ score }: { score: number }) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#22C55E' : score >= 60 ? '#84CC16' : score >= 40 ? '#EAB308' : '#EF4444';

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 128 128" className="h-32 w-32" role="img" aria-label={`${score}% compliance`}>
        <circle cx="64" cy="64" r={r} fill="none" stroke="#E5E7EB" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 64 64)"
        />
        <text x="64" y="60" textAnchor="middle" className="fill-foreground text-lg font-bold" fontSize="20" fontWeight="700">
          {score.toFixed(0)}%
        </text>
        <text x="64" y="78" textAnchor="middle" className="fill-muted-foreground" fontSize="10" fill="#6B7280">
          Compliance
        </text>
      </svg>
    </div>
  );
}

function StatusBadge({ status }: { status: RegulatoryReturnStatus['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        status === 'Compliant' && 'bg-green-100 text-green-700',
        status === 'At Risk' && 'bg-yellow-100 text-yellow-700',
        status === 'Non-Compliant' && 'bg-red-100 text-red-700',
      )}
    >
      {status === 'Compliant' && <CheckCircle2 className="h-3 w-3" />}
      {status === 'At Risk' && <AlertCircle className="h-3 w-3" />}
      {status === 'Non-Compliant' && <AlertCircle className="h-3 w-3" />}
      {status}
    </span>
  );
}

export function RBIComplianceDashboard({ data }: RBIComplianceDashboardProps) {
  const trendData = data.complianceTrend.labels.map((label, i) => ({
    period: label,
    score: data.complianceTrend.scores[i] ?? 0,
  }));

  return (
    <div className="space-y-6">
      {/* Top row: gauge + summary stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Gauge */}
        <div className="rounded-lg border border-border bg-card p-5 flex flex-col items-center justify-center">
          <ComplianceGauge score={data.overallComplianceScore} />
          <p className="mt-2 text-sm text-muted-foreground text-center">
            {data.compliantObligations} of {data.totalObligations} obligations in compliance
          </p>
        </div>

        {/* Breach count */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm font-medium text-muted-foreground">Recent Breaches (90 days)</p>
          </div>
          <p className="text-3xl font-bold text-foreground">{data.recentBreaches.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.recentBreaches.length === 0 ? 'No breaches detected' : 'AUs with compliance breaches'}
          </p>
        </div>

        {/* Upcoming deadlines */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <p className="text-sm font-medium text-muted-foreground">Upcoming Deadlines</p>
          </div>
          <p className="text-3xl font-bold text-foreground">{data.upcomingDeadlines.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Obligations due soon</p>
        </div>
      </div>

      {/* Regulatory returns status table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">Regulatory Returns Status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Assessment Unit</th>
                <th className="px-5 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Returns Score</th>
                <th className="px-5 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.regulatoryReturnsStatus.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-6 text-center text-sm text-muted-foreground">
                    No data available
                  </td>
                </tr>
              ) : (
                data.regulatoryReturnsStatus.map((row) => (
                  <tr key={row.auId} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-5 py-3 font-medium text-foreground">{row.auName}</td>
                    <td className="px-5 py-3 text-right text-muted-foreground">{row.regulatoryReturnsScore}</td>
                    <td className="px-5 py-3 text-right">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent breaches */}
      {data.recentBreaches.length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold text-foreground">Recent Breaches (Last 90 Days)</h3>
          </div>
          <div className="divide-y divide-border">
            {data.recentBreaches.map((breach, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{breach.auName}</p>
                  <p className="text-xs text-muted-foreground">{breach.periodName}</p>
                </div>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  Score: {breach.breachScore}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming deadlines */}
      {data.upcomingDeadlines.length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold text-foreground">Upcoming Deadlines</h3>
          </div>
          <div className="divide-y divide-border">
            {data.upcomingDeadlines.slice(0, 10).map((deadline) => (
              <div key={deadline.obligationId} className="flex items-start justify-between px-5 py-3">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-medium text-foreground truncate">{deadline.description}</p>
                  <p className="text-xs text-muted-foreground">{deadline.auName} · {deadline.obligationCode}</p>
                </div>
                <span className="shrink-0 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                  {deadline.frequency}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 12-month compliance trend */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">12-Month Compliance Trend</h3>
        </div>
        <div className="p-5">
          {trendData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No trend data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Compliance Score']} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#22C55E"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#22C55E' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
