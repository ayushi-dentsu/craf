import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import type { RiskDistribution } from '../../types';

interface TrendChartsProps {
  trends: {
    labels: string[];
    residualRisk: number[];
    controlEffectiveness: number[];
  };
  riskDistributionByTheme: Record<string, RiskDistribution>;
  controlsByEffectiveness: {
    effective: number;
    meetsRequirement: number;
    improvementNeeded: number;
    significantImprovement: number;
  };
}

const DONUT_COLORS = ['#22C55E', '#84CC16', '#EAB308', '#EF4444'];

export function TrendCharts({ trends, riskDistributionByTheme, controlsByEffectiveness }: TrendChartsProps) {
  // Line chart data
  const lineData = trends.labels.map((label, i) => ({
    quarter: label,
    residualRisk: trends.residualRisk[i],
    controlEffectiveness: trends.controlEffectiveness[i],
  }));

  // Bar chart data — risk distribution by theme
  const barData = Object.entries(riskDistributionByTheme).map(([theme, dist]) => ({
    theme: theme.length > 18 ? theme.slice(0, 16) + '…' : theme,
    extremelyHigh: dist.extremelyHigh,
    veryHigh: dist.veryHigh,
    high: dist.high,
    minor: dist.minor,
    insignificant: dist.insignificant,
  }));

  // Donut chart data
  const donutData = [
    { name: 'Effective', value: controlsByEffectiveness.effective },
    { name: 'Meets Requirement', value: controlsByEffectiveness.meetsRequirement },
    { name: 'Improvement Needed', value: controlsByEffectiveness.improvementNeeded },
    { name: 'Significant Improvement', value: controlsByEffectiveness.significantImprovement },
  ].filter((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Residual Risk & Control Effectiveness Trend */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Risk & Control Effectiveness Trend</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="residualRisk"
              name="Residual Risk %"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="controlEffectiveness"
              name="Control Effectiveness %"
              stroke="#22C55E"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Distribution by Theme */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Risk Distribution by Theme</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="theme" type="category" width={120} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="extremelyHigh" name="Extremely High" stackId="a" fill="#EF4444" />
            <Bar dataKey="veryHigh" name="Very High" stackId="a" fill="#F97316" />
            <Bar dataKey="high" name="High" stackId="a" fill="#EAB308" />
            <Bar dataKey="minor" name="Minor" stackId="a" fill="#84CC16" />
            <Bar dataKey="insignificant" name="Insignificant" stackId="a" fill="#22C55E" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Controls by Effectiveness Donut */}
      <div className="rounded-lg border border-border bg-card p-4 lg:col-span-2">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Controls by Effectiveness</h3>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width={300} height={220}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {donutData.map((_, i) => (
                  <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
