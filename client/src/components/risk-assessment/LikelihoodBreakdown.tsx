import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';

interface LikelihoodParams {
  volumeGrowth: { value: number; score: number };
  complexity: { value: number; score: number };
  regulatoryReturns: { value: number; score: number };
  complianceBreaches: { value: number; score: number };
  controlFailures: { value: number; score: number };
  customerComplaints: { value: number; score: number };
}

interface LikelihoodBreakdownProps {
  parameters: LikelihoodParams;
  likelihoodScore: number;
  likelihoodRating: string;
}

const PARAM_LABELS: Record<keyof LikelihoodParams, string> = {
  volumeGrowth: 'Volume Growth',
  complexity: 'Complexity',
  regulatoryReturns: 'Regulatory Returns',
  complianceBreaches: 'Compliance Breaches',
  controlFailures: 'Control Failures',
  customerComplaints: 'Customer Complaints',
};

export function LikelihoodBreakdown({ parameters, likelihoodScore, likelihoodRating }: LikelihoodBreakdownProps) {
  const radarData = (Object.keys(PARAM_LABELS) as (keyof LikelihoodParams)[]).map((key) => ({
    param: PARAM_LABELS[key],
    score: parameters[key].score,
    fullMark: 25,
  }));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Likelihood</h4>
        <div className="text-right">
          <span className="text-lg font-bold text-foreground">{likelihoodScore}</span>
          <span className="ml-2 text-xs text-muted-foreground">{likelihoodRating}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis dataKey="param" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 25]} tick={{ fontSize: 9 }} />
          <Radar dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
          <Tooltip />
        </RadarChart>
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
          {(Object.keys(PARAM_LABELS) as (keyof LikelihoodParams)[]).map((key) => (
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
