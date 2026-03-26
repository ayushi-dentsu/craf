import { useState } from 'react';
import { Shield, ChevronDown, User, LogOut } from 'lucide-react';

export function Header() {
  const [viewMode, setViewMode] = useState<'realtime' | 'periodic'>('periodic');
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
            FY 2024-25
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {periodOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border border-border bg-card py-1 shadow-md">
              <button
                onClick={() => setPeriodOpen(false)}
                className="w-full px-3 py-1.5 text-left text-sm font-medium hover:bg-accent"
              >
                FY 2024-25
              </button>
              <button
                onClick={() => setPeriodOpen(false)}
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent"
              >
                FY 2023-24
              </button>
            </div>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex rounded-md border border-input text-sm">
          <button
            onClick={() => setViewMode('realtime')}
            className={`px-3 py-1.5 ${viewMode === 'realtime' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
          >
            Realtime
          </button>
          <button
            onClick={() => setViewMode('periodic')}
            className={`px-3 py-1.5 ${viewMode === 'periodic' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
          >
            Periodic
          </button>
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
