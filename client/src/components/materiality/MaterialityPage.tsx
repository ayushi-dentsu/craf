import { useState } from 'react';
import { Calculator, ChevronRight, Save } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SignificantAccount {
  id: number;
  accountCode: string;
  accountName: string;
  level: 'Level 2' | 'Level 3';
  balance: number;
  isMaterial: boolean;
  mappedProducts?: string[];
}

interface MaterialityData {
  periodId: number;
  profitBeforeTax: number;
  totalAssets: number;
  revenueMateriality: number;
  balanceSheetMateriality: number;
  haircutPercent: number;
  finalRevenueMateriality: number;
  finalBSMateriality: number;
  tolerableError: number | null;
}

interface MaterialityPageProps {
  data?: MaterialityData;
  significantAccounts?: SignificantAccount[];
  onSave?: (values: {
    periodId: number;
    profitBeforeTax: number;
    totalAssets: number;
    haircutPercent: number;
    tolerableError?: number;
  }) => void;
  periodId?: number;
  isSaving?: boolean;
}

function formatCurrency(val: number): string {
  if (val >= 1_000_000_000) return `₹${(val / 1_000_000_000).toFixed(2)}B`;
  if (val >= 1_000_000) return `₹${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `₹${(val / 1_000).toFixed(2)}K`;
  return `₹${val.toFixed(2)}`;
}

/** Waterfall step component */
function WaterfallStep({
  label,
  value,
  sublabel,
  isResult,
  arrow,
}: {
  label: string;
  value: string;
  sublabel?: string;
  isResult?: boolean;
  arrow?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'flex-1 rounded-lg border p-3 text-center',
          isResult ? 'border-primary bg-primary/10' : 'border-border bg-muted/20',
        )}
      >
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn('text-sm font-bold mt-0.5', isResult ? 'text-primary' : 'text-foreground')}>
          {value}
        </p>
        {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
      {arrow && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
    </div>
  );
}

export function MaterialityPage({
  data,
  significantAccounts = [],
  onSave,
  periodId = 1,
  isSaving = false,
}: MaterialityPageProps) {
  const [pbt, setPbt] = useState<string>(data?.profitBeforeTax?.toString() ?? '');
  const [totalAssets, setTotalAssets] = useState<string>(data?.totalAssets?.toString() ?? '');
  const [haircut, setHaircut] = useState<string>(data?.haircutPercent?.toString() ?? '25');
  const [tolerableError, setTolerableError] = useState<string>(data?.tolerableError?.toString() ?? '');

  // Live computed values
  const pbtNum = parseFloat(pbt) || 0;
  const assetsNum = parseFloat(totalAssets) || 0;
  const haircutNum = parseFloat(haircut) || 25;

  const revMateriality = pbtNum * 0.05;
  const bsMateriality = assetsNum * 0.005;
  const finalRevMateriality = revMateriality * (1 - haircutNum / 100);
  const finalBSMateriality = bsMateriality * (1 - haircutNum / 100);

  function handleSave() {
    if (!onSave) return;
    onSave({
      periodId,
      profitBeforeTax: pbtNum,
      totalAssets: assetsNum,
      haircutPercent: haircutNum,
      tolerableError: tolerableError ? parseFloat(tolerableError) : undefined,
    });
  }

  return (
    <div className="space-y-6">
      {/* Financial inputs */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <Calculator className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Financial Inputs</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Profit Before Tax (₹)
            </label>
            <input
              type="number"
              value={pbt}
              onChange={(e) => setPbt(e.target.value)}
              placeholder="e.g. 10000000000"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Total Assets (₹)
            </label>
            <input
              type="number"
              value={totalAssets}
              onChange={(e) => setTotalAssets(e.target.value)}
              placeholder="e.g. 500000000000"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Haircut (%)
            </label>
            <input
              type="number"
              value={haircut}
              onChange={(e) => setHaircut(e.target.value)}
              min={0}
              max={100}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Tolerable Error (₹)
            </label>
            <input
              type="number"
              value={tolerableError}
              onChange={(e) => setTolerableError(e.target.value)}
              placeholder="Optional"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="border-t border-border px-5 py-3 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving || !pbtNum || !assetsNum}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Waterfall visualization */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">Revenue Materiality Waterfall</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 p-5">
          <WaterfallStep label="PBT" value={formatCurrency(pbtNum)} arrow />
          <WaterfallStep label="× 5%" value={formatCurrency(revMateriality)} sublabel="Revenue Materiality" arrow />
          <WaterfallStep label={`− ${haircutNum}% Haircut`} value={formatCurrency(finalRevMateriality)} sublabel="Final Revenue Materiality" isResult />
        </div>
      </div>

      {/* Balance sheet waterfall */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">Balance Sheet Materiality Waterfall</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 p-5">
          <WaterfallStep label="Total Assets" value={formatCurrency(assetsNum)} arrow />
          <WaterfallStep label="× 0.5%" value={formatCurrency(bsMateriality)} sublabel="BS Materiality" arrow />
          <WaterfallStep label={`− ${haircutNum}% Haircut`} value={formatCurrency(finalBSMateriality)} sublabel="Final BS Materiality" isResult />
        </div>
      </div>

      {/* Materiality summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground mb-1">Final Revenue Materiality</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(finalRevMateriality)}</p>
          <p className="text-xs text-muted-foreground mt-1">5% of PBT × (1 − {haircutNum}% haircut)</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground mb-1">Final Balance Sheet Materiality</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(finalBSMateriality)}</p>
          <p className="text-xs text-muted-foreground mt-1">0.5% of Total Assets × (1 − {haircutNum}% haircut)</p>
        </div>
      </div>

      {/* Significant accounts table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">Significant Accounts</h3>
        </div>
        {significantAccounts.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No significant accounts identified. Save financial inputs to run analysis.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Account</th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Level</th>
                  <th className="px-5 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Balance</th>
                  <th className="px-5 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Material</th>
                </tr>
              </thead>
              <tbody>
                {significantAccounts.map((acct) => (
                  <tr key={acct.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{acct.accountName}</p>
                      <p className="text-xs text-muted-foreground">{acct.accountCode}</p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{acct.level}</td>
                    <td className="px-5 py-3 text-right font-medium text-foreground">
                      {formatCurrency(acct.balance)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          acct.isMaterial ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
                        )}
                      >
                        {acct.isMaterial ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
