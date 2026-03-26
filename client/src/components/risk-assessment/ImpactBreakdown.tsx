import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

interface ImpactParams {
  businessImpact: { value: string; score: number };
  reputationalImpact: { value: string; score: number };
  financialPenalty: { value: string; score: number };
  glImpact: { value: string; score: number };
}

interface ImpactBreakdownProps {
  parameters: ImpactParams;
  impactScore: number;
  impactRating: string;
}

const PARAM_LABELS: Record<keyof ImpactParams, string> = {
  businessImpact: 'Business Impact',
  reputationalImpact: 'Media Coverage',
  financialPenalty: 'Financial Penalty',
  glImpact: 'G/L Impact',
};

function getBarColor(score: number) {
  if (score >= 25) return '#EF4444';
  if (score >= 20) return '#F97316';
  if (score >= 15) return '#EAB308';
  if (score >= 10) return '#84CC16';
  return '#22C55E';
}

export function ImpactBreakdown({ parameters, impactScore, impactRating }: ImpactBreakdownProps) {
  const barData = (Object.keys(PARAM_LABELS) as (keyof ImpactParams)[]).map((key) => ({
    param: PARAM_LABELS[key],
    score: parameters[key].score,
    value: parameters[key].value,
  }));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Impact</h4>
        <div className="text-right">
          <span className="text-lg font-bold text-foreground">{impactScore}</span>
          <span className="ml-2 text-xs text-muted-foreground">{impactRating}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={barData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis type="number" domain={[0, 25]} tick={{ fontSize: 10 }} />
          <YAxis dataKey="param" type="category" width={110} tick={{ fontSize: 10 }} />
          <Tooltip formatter={(val: number) => [val, 'Score']} />
          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
            {barData.map((entry, i) => (
              <Cell key={i} fill={getBarColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Parameter table */}
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="pb-1">Parameter</th>
            <th className="pb-1 text-right">Value</th>
            <th className="pb-1 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {(Object.keys(PARAM_LABELS) as (keyof ImpactParams)[]).map((key) => (
            <tr key={key} className="border-b border-border/50">
              <td className="py-1">{PARAM_LABELS[key]}</td>
              <td className="py-1 text-right">{parameters[key].value}</td>
              <td className="py-1 text-right font-medium">{parameters[key].score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
