import { useState } from 'react';
import { Shield, ChevronDown, User, LogOut } from 'lucide-react';
import { usePeriod } from '../../hooks/usePeriod';

const PERIODS = [
  { id: undefined, label: 'FY 2024-25' },
  { id: 1, label: 'FY 2023-24' },
];

export function Header() {
  const { periodLabel, setPeriod } = usePeriod();
  const [periodOpen, setPeriodOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold text-foreground">CRAF</span>
        <span className="hidden text-sm text-muted-foreground sm:inline">
          Converged Risk Assessment Framework
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Period Selector */}
        <div className="relative">
          <button
            onClick={() => setPeriodOpen(!periodOpen)}
            className="flex items-center gap-1 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent"
          >
            {periodLabel}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {periodOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border border-border bg-card py-1 shadow-md">
              {PERIODS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setPeriod(p.id, p.label);
                    setPeriodOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-sm hover:bg-accent ${
                    p.label === periodLabel ? 'font-medium' : ''
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserOpen(!userOpen)}
            className="flex items-center gap-1 rounded-full border border-input p-1.5 hover:bg-accent"
            aria-label="User menu"
          >
            <User className="h-4 w-4" />
          </button>
          {userOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border border-border bg-card py-1 shadow-md">
              <div className="border-b border-border px-3 py-2">
                <p className="text-sm font-medium">GCCO</p>
                <p className="text-xs text-muted-foreground">gcco@bank.com</p>
              </div>
              <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
