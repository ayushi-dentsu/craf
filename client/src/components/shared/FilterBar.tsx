import { cn } from '../../lib/utils';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDefinition {
  key: string;
  label: string;
  type: 'select' | 'text' | 'toggle';
  options?: FilterOption[];
  placeholder?: string;
}

export type FilterState = Record<string, string | boolean>;

interface FilterBarProps {
  filters: FilterDefinition[];
  values: FilterState;
  onChange: (values: FilterState) => void;
  className?: string;
}

export function FilterBar({ filters, values, onChange, className }: FilterBarProps) {
  const hasActiveFilters = Object.values(values).some(
    (v) => v !== '' && v !== false
  );

  const handleChange = (key: string, value: string | boolean) => {
    onChange({ ...values, [key]: value });
  };

  const clearAll = () => {
    const cleared: FilterState = {};
    for (const f of filters) {
      cleared[f.key] = f.type === 'toggle' ? false : '';
    }
    onChange(cleared);
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {filters.map((f) => {
        if (f.type === 'select') {
          return (
            <select
              key={f.key}
              value={(values[f.key] as string) ?? ''}
              onChange={(e) => handleChange(f.key, e.target.value)}
              aria-label={f.label}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground"
            >
              <option value="">{f.placeholder ?? f.label}</option>
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          );
        }

        if (f.type === 'text') {
          return (
            <input
              key={f.key}
              type="text"
              value={(values[f.key] as string) ?? ''}
              onChange={(e) => handleChange(f.key, e.target.value)}
              placeholder={f.placeholder ?? f.label}
              aria-label={f.label}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground"
            />
          );
        }

        // toggle
        return (
          <label
            key={f.key}
            className="inline-flex cursor-pointer items-center gap-2 text-sm"
          >
            <input
              type="checkbox"
              checked={!!values[f.key]}
              onChange={(e) => handleChange(f.key, e.target.checked)}
              className="rounded border-input"
            />
            {f.label}
          </label>
        );
      })}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
