import { createContext, useContext, useState, type ReactNode } from 'react';

interface PeriodContextValue {
  /** undefined = current/default period; number = specific period ID */
  periodId: number | undefined;
  periodLabel: string;
  setPeriod: (id: number | undefined, label: string) => void;
}

const PeriodContext = createContext<PeriodContextValue>({
  periodId: undefined,
  periodLabel: 'FY 2024-25',
  setPeriod: () => {},
});

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [periodId, setPeriodId] = useState<number | undefined>(undefined);
  const [periodLabel, setPeriodLabel] = useState('FY 2024-25');

  const setPeriod = (id: number | undefined, label: string) => {
    setPeriodId(id);
    setPeriodLabel(label);
  };

  return (
    <PeriodContext.Provider value={{ periodId, periodLabel, setPeriod }}>
      {children}
    </PeriodContext.Provider>
  );
}

export function usePeriod() {
  return useContext(PeriodContext);
}
