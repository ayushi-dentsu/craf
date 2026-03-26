import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { HeatmapEntry } from '../../types';
import { BusinessArea } from '../../types';

interface RiskHeatmapProps {
  data: HeatmapEntry[];
  themes?: { id: number; name: string }[];
}

const RISK_RATINGS = ['Extremely High', 'Very High', 'High', 'Medium', 'Low', 'Negligible'];

const BUSINESS_AREAS = [
  BusinessArea.RetailBanking,
  BusinessArea.CorporateWholesaleBanking,
  BusinessArea.TreasuryAndMarkets,
  BusinessArea.SupportFunctions,
];

export function RiskHeatmap({ data, themes = [] }: RiskHeatmapProps) {
  const navigate = useNavigate();
  const [businessAreaFilter, setBusinessAreaFilter] = useState('');
  const [riskRatingFilter, setRiskRatingFilter] = useState('');
  const [themeFilter, setThemeFilter] = useState('');
  const [hoveredAu, setHoveredAu] = useState<HeatmapEntry | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const filtered = useMemo(() => {
    let result = data;
    if (businessAreaFilter) result = result.filter((e) => e.businessArea === businessAreaFilter);
    if (riskRatingFilter) result = result.filter((e) => e.residualRiskRating === riskRatingFilter);
    if (themeFilter) result = result.filter((e) => e.themeName === themeFilter);
    return result;
  }, [data, businessAreaFilter, riskRatingFilter, themeFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, HeatmapEntry[]>();
    for (const area of BUSINESS_AREAS) {
      map.set(area, []);
    }
    for (const entry of filtered) {
      const list = map.get(entry.businessArea) ?? [];
      list.push(entry);
      map.set(entry.businessArea, list);
    }
    return map;
  }, [filtered]);

  const hasFilters = businessAreaFilter || riskRatingFilter || themeFilter;

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select
          value={businessAreaFilter}
          onChange={(e) => setBusinessAreaFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-2 py-1 text-sm"
          aria-label="Filter by business area"
        >
          <option value="">All Business Areas</option>
          {BUSINESS_AREAS.map((ba) => (
            <option key={ba} value={ba}>{ba}</option>
          ))}
        </select>
        <select
          value={riskRatingFilter}
          onChange={(e) => setRiskRatingFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-2 py-1 text-sm"
          aria-label="Filter by risk rating"
        >
          <option value="">All Risk Ratings</option>
          {RISK_RATINGS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={themeFilter}
          onChange={(e) => setThemeFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-2 py-1 text-sm"
          aria-label="Filter by theme"
        >
          <option value="">All Themes</option>
          {themes.map((t) => (
            <option key={t.id} value={t.name}>{t.name}</option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={() => { setBusinessAreaFilter(''); setRiskRatingFilter(''); setThemeFilter(''); }}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Heatmap grid */}
      <div className="space-y-4 p-4">
        {Array.from(grouped.entries()).map(([area, entries]) => {
          if (entries.length === 0 && hasFilters) return null;
          return (
            <div key={area}>
              <h3 className="mb-2 text-sm font-semibold text-foreground">{area}</h3>
              {entries.length === 0 ? (
                <p className="text-xs text-muted-foreground">No assessment units</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {entries.map((entry) => (
                    <button
                      key={entry.auId}
                      onClick={() => navigate(`/dashboard/au/${entry.auId}`)}
                      onMouseEnter={(e) => {
                        setHoveredAu(entry);
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
                      }}
                      onMouseLeave={() => setHoveredAu(null)}
                      className={cn(
                        'relative flex h-10 min-w-[2.5rem] items-center justify-center rounded px-2 text-xs font-medium text-white transition-transform hover:scale-105',
                      )}
                      style={{ backgroundColor: entry.color }}
                      aria-label={`${entry.auName}: ${entry.residualRiskRating}`}
                    >
                      {entry.auName.length > 12 ? entry.auName.slice(0, 10) + '…' : entry.auName}
                      {entry.hasEarlyWarning && (
                        <AlertTriangle className="absolute -right-1 -top-1 h-3.5 w-3.5 text-amber-300 drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {hoveredAu && (
        <div
          className="pointer-events-none fixed z-50 rounded-md border border-border bg-card px-3 py-2 shadow-lg"
          style={{ left: tooltipPos.x, top: tooltipPos.y - 8, transform: 'translate(-50%, -100%)' }}
          role="tooltip"
        >
          <p className="text-sm font-medium">{hoveredAu.auName}</p>
          <p className="text-xs text-muted-foreground">
            Score: {hoveredAu.residualRiskScore.toFixed(1)} · {hoveredAu.residualRiskRating}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 border-t border-border px-4 py-2">
        <span className="text-xs text-muted-foreground">Legend:</span>
        {[
          { label: 'Extremely High', color: '#EF4444' },
          { label: 'Very High', color: '#F97316' },
          { label: 'High', color: '#EAB308' },
          { label: 'Minor', color: '#84CC16' },
          { label: 'Insignificant', color: '#22C55E' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: l.color }} />
            <span className="text-xs text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
