import { useState } from 'react';
import { YearOverYearView } from '../components/comparison/YearOverYearView';
import { BeforeAfterView } from '../components/comparison/BeforeAfterView';
import { useYearOverYear, useBeforeAfter } from '../hooks/useComparison';
import { cn } from '../lib/utils';

type Tab = 'yoy' | 'before-after';

// Demo: hardcoded AU 1, period 2 vs 1
const DEMO_AU_ID = 1;
const DEMO_PERIOD_ID = 2;

export function ComparisonPage() {
  const [tab, setTab] = useState<Tab>('yoy');

  const yoy = useYearOverYear({ auId: DEMO_AU_ID });
  const beforeAfter = useBeforeAfter(DEMO_AU_ID, DEMO_PERIOD_ID);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Comparison</h1>
        <div className="flex rounded-md border border-input text-sm">
          {(['yoy', 'before-after'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-3 py-1.5',
                tab === t ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
              )}
            >
              {t === 'yoy' ? 'Year-over-Year' : 'Before / After'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'yoy' && (
        <>
          {yoy.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {yoy.error && <p className="text-sm text-destructive">Failed to load comparison data.</p>}
          {yoy.data && <YearOverYearView data={yoy.data as Parameters<typeof YearOverYearView>[0]['data']} />}
        </>
      )}

      {tab === 'before-after' && (
        <>
          {beforeAfter.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {beforeAfter.error && <p className="text-sm text-destructive">Failed to load before/after data.</p>}
          {beforeAfter.data && <BeforeAfterView data={beforeAfter.data as Parameters<typeof BeforeAfterView>[0]['data']} />}
        </>
      )}
    </div>
  );
}
