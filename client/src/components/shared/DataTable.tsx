import { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => unknown);
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: T) => void;
}

type SortDir = 'asc' | 'desc';

function getValue<T>(row: T, accessor: Column<T>['accessor']): unknown {
  if (typeof accessor === 'function') return accessor(row);
  return row[accessor];
}

export function DataTable<T>({
  data,
  columns,
  pageSize = 10,
  searchable = false,
  searchPlaceholder = 'Search…',
  emptyMessage = 'No data available.',
  className,
  onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(0);

  // Filter
  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const v = getValue(row, col.accessor);
        return v != null && String(v).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  // Sort
  const sorted = useMemo(() => {
    if (sortCol === null) return filtered;
    const col = columns[sortCol];
    return [...filtered].sort((a, b) => {
      const va = getValue(a, col.accessor);
      const vb = getValue(b, col.accessor);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      const cmp =
        typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir, columns]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (idx: number) => {
    const col = columns[idx];
    if (col.sortable === false) return;
    if (sortCol === idx) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(idx);
      setSortDir('asc');
    }
    setPage(0);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {searchable && (
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground"
        />
      )}

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map((col, idx) => {
                const isSortable = col.sortable !== false;
                return (
                  <th
                    key={idx}
                    scope="col"
                    className={cn(
                      'px-4 py-2 text-left font-medium text-muted-foreground',
                      isSortable && 'cursor-pointer select-none hover:text-foreground'
                    )}
                    onClick={() => isSortable && handleSort(idx)}
                    aria-sort={
                      sortCol === idx
                        ? sortDir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {sortCol === idx && (
                        <span aria-hidden="true">
                          {sortDir === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={cn(
                    'border-b border-border last:border-0',
                    onRowClick && 'cursor-pointer hover:bg-muted/30'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col, cIdx) => {
                    const raw = getValue(row, col.accessor);
                    return (
                      <td key={cIdx} className="px-4 py-2">
                        {col.render ? col.render(raw, row) : (raw as React.ReactNode)}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page + 1} of {totalPages} ({sorted.length} rows)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border border-input px-3 py-1 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-input px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
