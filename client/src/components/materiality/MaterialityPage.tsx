import { useState, useMemo } from 'react';
import { Calculator, ChevronRight, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

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
  significantAccounts?: unknown[];
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

function fmt(val: number): string {
  if (val >= 1_00_000) return `₹${(val / 1_00_000).toFixed(2)} L Cr`;
  if (val >= 1_000) return `₹${(val / 1_000).toFixed(2)} K Cr`;
  if (val >= 1) return `₹${val.toFixed(2)} Cr`;
  return `₹${(val * 100).toFixed(2)} L`;
}

function WaterfallStep({ label, value, sublabel, isResult, arrow }: {
  label: string; value: string; sublabel?: string; isResult?: boolean; arrow?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        'flex-1 rounded-lg border p-3 text-center min-w-[140px]',
        isResult ? 'border-primary bg-primary/10' : 'border-border bg-muted/20',
      )}>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn('text-sm font-bold mt-0.5', isResult ? 'text-primary' : 'text-foreground')}>{value}</p>
        {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
      {arrow && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
    </div>
  );
}

// Demo significant accounts — in a real system these come from the trial balance
const DEMO_ACCOUNTS = [
  { code: 'SA-001', name: 'Advances — Retail Loans', level: 'Account (L3)' as const, balance: 4_52_000, auMapping: 'Retail Assets Group' },
  { code: 'SA-002', name: 'Advances — Corporate Loans', level: 'Account (L3)' as const, balance: 3_18_000, auMapping: 'Corporate Banking Group' },
  { code: 'SA-003', name: 'Deposits — Savings', level: 'Account (L3)' as const, balance: 5_10_000, auMapping: 'Liabilities Operations Group' },
  { code: 'SA-004', name: 'Deposits — Term Deposits', level: 'Account (L3)' as const, balance: 3_85_000, auMapping: 'Liabilities Operations Group' },
  { code: 'SA-005', name: 'Investments — Government Securities', level: 'Account (L3)' as const, balance: 2_90_000, auMapping: 'Treasury Operations' },
  { code: 'SA-006', name: 'Interest Income', level: 'Head (L2)' as const, balance: 1_62_000, auMapping: 'Multiple AUs' },
  { code: 'SA-007', name: 'Interest Expense', level: 'Head (L2)' as const, balance: 98_000, auMapping: 'Multiple AUs' },
  { code: 'SA-008', name: 'Fee & Commission Income', level: 'Head (L2)' as const, balance: 42_000, auMapping: 'Multiple AUs' },
  { code: 'SA-009', name: 'Provisions & Write-offs', level: 'Account (L3)' as const, balance: 28_000, auMapping: 'Credit Risk Group' },
  { code: 'SA-010', name: 'Trade Finance — LC/BG', level: 'Account (L3)' as const, balance: 1_85_000, auMapping: 'Trade Finance Operations Group' },
  { code: 'SA-011', name: 'Derivative Assets', level: 'Account (L3)' as const, balance: 75_000, auMapping: 'Treasury Operations' },
  { code: 'SA-012', name: 'Fixed Assets', level: 'Head (L2)' as const, balance: 12_000, auMapping: 'Support Functions' },
  { code: 'SA-013', name: 'Other Liabilities', level: 'Head (L2)' as const, balance: 8_500, auMapping: 'Support Functions' },
  { code: 'SA-014', name: 'Cash & Bank Balances', level: 'Account (L3)' as const, balance: 45_000, auMapping: 'Treasury Operations' },
];

export function MaterialityPage({
  data,
  onSave,
  periodId = 2,
  isSaving = false,
}: MaterialityPageProps) {
  const [pbt, setPbt] = useState<string>(data?.profitBeforeTax?.toString() ?? '46000');
  const [totalAssets, setTotalAssets] = useState<string>(data?.totalAssets?.toString() ?? '2200000');
  const [haircut, setHaircut] = useState<string>(data?.haircutPercent?.toString() ?? '25');
  const [tolerableError, setTolerableError] = useState<string>(data?.tolerableError?.toString() ?? '1700');

  const pbtNum = parseFloat(pbt) || 0;
  const assetsNum = parseFloat(totalAssets) || 0;
  const haircutNum = parseFloat(haircut) || 25;
  const teNum = parseFloat(tolerableError) || 0;

  const revMateriality = pbtNum * 0.05;
  const bsMateriality = assetsNum * 0.005;
  const finalRevMateriality = revMateriality * (1 - haircutNum / 100);
  const finalBSMateriality = bsMateriality * (1 - haircutNum / 100);

  // Determine which accounts are significant
  const accountsWithStatus = useMemo(() => {
    return DEMO_ACCOUNTS.map((acct) => {
      const isRevenueMaterial = acct.balance >= finalRevMateriality;
      const isBSMaterial = acct.balance >= finalBSMateriality;
      return { ...acct, isRevenueMaterial, isBSMaterial, isMaterial: isRevenueMaterial || isBSMaterial };
    });
  }, [finalRevMateriality, finalBSMateriality]);

  const significantCount = accountsWithStatus.filter((a) => a.isMaterial).length;

  function handleSave() {
    if (!onSave) return;
    onSave({
      periodId,
      profitBeforeTax: pbtNum,
      totalAssets: assetsNum,
      haircutPercent: haircutNum,
      tolerableError: teNum || undefined,
    });
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Financial Inputs */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <Calculator className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Step 1 — Determine Materiality Thresholds</h2>
        </div>
        <p className="px-5 pt-3 text-xs text-muted-foreground">
          Revenue materiality = 5% of PBT. Balance sheet materiality = 0.5% of Total Assets. A 25% haircut is applied per CRAF framework. All values in ₹ Crores.
        </p>
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Profit Before Tax (₹ Cr)</label>
            <input type="number" value={pbt} onChange={(e) => setPbt(e.target.value)} placeholder="e.g. 46000"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Total Assets (₹ Cr)</label>
            <input type="number" value={totalAssets} onChange={(e) => setTotalAssets(e.target.value)} placeholder="e.g. 2200000"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Haircut (%)</label>
            <input type="number" value={haircut} onChange={(e) => setHaircut(e.target.value)} min={0} max={100}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tolerable Error (₹ Cr)</label>
            <input type="number" value={tolerableError} onChange={(e) => setTolerableError(e.target.value)} placeholder="Bank threshold"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>
        <div className="border-t border-border px-5 py-3 flex justify-end">
          <button onClick={handleSave} disabled={isSaving || !pbtNum || !assetsNum}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
            <Save className="h-4 w-4" />{isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Waterfall: Revenue */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">Revenue Materiality Waterfall</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 p-5">
          <WaterfallStep label="PBT" value={fmt(pbtNum)} arrow />
          <WaterfallStep label="× 5%" value={fmt(revMateriality)} sublabel="Revenue Materiality" arrow />
          <WaterfallStep label={`− ${haircutNum}% Haircut`} value={fmt(finalRevMateriality)} sublabel="Final Threshold" isResult />
        </div>
      </div>

      {/* Waterfall: Balance Sheet */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">Balance Sheet Materiality Waterfall</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 p-5">
          <WaterfallStep label="Total Assets" value={fmt(assetsNum)} arrow />
          <WaterfallStep label="× 0.5%" value={fmt(bsMateriality)} sublabel="BS Materiality" arrow />
          <WaterfallStep label={`− ${haircutNum}% Haircut`} value={fmt(finalBSMateriality)} sublabel="Final Threshold" isResult />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Final Revenue Materiality</p>
          <p className="text-xl font-bold text-primary">{fmt(finalRevMateriality)}</p>
          <p className="text-xs text-muted-foreground mt-1">5% of PBT after {haircutNum}% haircut</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Final BS Materiality</p>
          <p className="text-xl font-bold text-primary">{fmt(finalBSMateriality)}</p>
          <p className="text-xs text-muted-foreground mt-1">0.5% of Assets after {haircutNum}% haircut</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Tolerable Error</p>
          <p className="text-xl font-bold text-foreground">{teNum ? fmt(teNum) : '—'}</p>
          <p className="text-xs text-muted-foreground mt-1">Bank-defined threshold</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Significant Accounts</p>
          <p className="text-xl font-bold text-foreground">{significantCount} / {DEMO_ACCOUNTS.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Exceeding materiality threshold</p>
        </div>
      </div>

      {/* Step 2: Significant Accounts Identification */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">Step 2 — Identify Significant Accounts</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Accounts with balance exceeding either revenue or BS materiality threshold are flagged as significant.
            Non-significant accounts at Account (L3) level are aggregated at Head (L2) level for re-evaluation.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Account</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Level</th>
                <th className="px-5 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Balance (₹ Cr)</th>
                <th className="px-5 py-2.5 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide">Rev. Material</th>
                <th className="px-5 py-2.5 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide">BS Material</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Mapped AU / Product</th>
                <th className="px-5 py-2.5 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide">Significant</th>
              </tr>
            </thead>
            <tbody>
              {accountsWithStatus.map((acct) => (
                <tr key={acct.code} className={cn('border-b border-border last:border-0 hover:bg-muted/20', acct.isMaterial && 'bg-primary/5')}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{acct.name}</p>
                    <p className="text-xs text-muted-foreground">{acct.code}</p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{acct.level}</td>
                  <td className="px-5 py-3 text-right font-medium text-foreground">{fmt(acct.balance)}</td>
                  <td className="px-5 py-3 text-center">
                    {acct.isRevenueMaterial
                      ? <CheckCircle2 className="inline h-4 w-4 text-green-600" />
                      : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {acct.isBSMaterial
                      ? <CheckCircle2 className="inline h-4 w-4 text-green-600" />
                      : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{acct.auMapping}</td>
                  <td className="px-5 py-3 text-center">
                    {acct.isMaterial
                      ? <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"><AlertCircle className="h-3 w-3" />Yes</span>
                      : <span className="text-xs text-muted-foreground">No</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
