import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Badge } from './Badge';
import { TrafficLight } from './TrafficLight';
import { DataTable, type Column } from './DataTable';
import { FilterBar, type FilterDefinition, type FilterState } from './FilterBar';

// ── Badge ──────────────────────────────────────────────

describe('Badge', () => {
  it('renders label text', () => {
    render(<Badge label="High" />);
    expect(screen.getByText('High')).toBeTruthy();
  });

  it('auto-resolves variant from CRAF rating labels', () => {
    const { container } = render(<Badge label="Extremely High" />);
    const el = container.querySelector('span')!;
    expect(el.className).toContain('bg-red-100');
    expect(el.className).toContain('text-red-800');
  });

  it('maps Well Controlled to green', () => {
    const { container } = render(<Badge label="Well Controlled" />);
    const el = container.querySelector('span')!;
    expect(el.className).toContain('bg-green-100');
  });

  it('maps Improvement Needed to orange', () => {
    const { container } = render(<Badge label="Improvement Needed" />);
    const el = container.querySelector('span')!;
    expect(el.className).toContain('bg-orange-100');
  });

  it('falls back to gray for unknown labels', () => {
    const { container } = render(<Badge label="Unknown" />);
    const el = container.querySelector('span')!;
    expect(el.className).toContain('bg-gray-100');
  });

  it('allows explicit variant override', () => {
    const { container } = render(<Badge label="Custom" variant="lime" />);
    const el = container.querySelector('span')!;
    expect(el.className).toContain('bg-lime-100');
  });

  it('supports compact size', () => {
    const { container } = render(<Badge label="Test" compact />);
    const el = container.querySelector('span')!;
    expect(el.className).toContain('py-0.5');
  });
});

// ── TrafficLight ───────────────────────────────────────

describe('TrafficLight', () => {
  it('renders with correct color', () => {
    const { container } = render(<TrafficLight color="red" />);
    const dot = container.querySelector('span span')!;
    expect(dot.className).toContain('bg-red-500');
  });

  it('renders label text', () => {
    render(<TrafficLight color="green" label="All clear" />);
    expect(screen.getByText('All clear')).toBeTruthy();
  });

  it('has accessible aria-label', () => {
    render(<TrafficLight color="yellow" label="Warning" />);
    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByRole('status').getAttribute('aria-label')).toBe('Warning');
  });

  it('defaults aria-label to color name when no label', () => {
    render(<TrafficLight color="red" />);
    expect(screen.getByRole('status').getAttribute('aria-label')).toBe('red indicator');
  });

  it('applies pulse animation when enabled', () => {
    const { container } = render(<TrafficLight color="red" pulse />);
    const dot = container.querySelector('span span')!;
    expect(dot.className).toContain('animate-pulse');
  });

  it('does not pulse by default', () => {
    const { container } = render(<TrafficLight color="green" />);
    const dot = container.querySelector('span span')!;
    expect(dot.className).not.toContain('animate-pulse');
  });
});

// ── DataTable ──────────────────────────────────────────

interface TestRow {
  id: number;
  name: string;
  score: number;
}

const testData: TestRow[] = [
  { id: 1, name: 'Alpha', score: 90 },
  { id: 2, name: 'Beta', score: 70 },
  { id: 3, name: 'Gamma', score: 85 },
];

const testColumns: Column<TestRow>[] = [
  { header: 'ID', accessor: 'id' },
  { header: 'Name', accessor: 'name' },
  { header: 'Score', accessor: 'score' },
];

describe('DataTable', () => {
  it('renders all rows', () => {
    render(<DataTable data={testData} columns={testColumns} />);
    expect(screen.getByText('Alpha')).toBeTruthy();
    expect(screen.getByText('Beta')).toBeTruthy();
    expect(screen.getByText('Gamma')).toBeTruthy();
  });

  it('renders column headers', () => {
    render(<DataTable data={testData} columns={testColumns} />);
    expect(screen.getByText('ID')).toBeTruthy();
    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByText('Score')).toBeTruthy();
  });

  it('shows empty message when no data', () => {
    render(<DataTable data={[]} columns={testColumns} emptyMessage="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeTruthy();
  });

  it('sorts by column on header click', () => {
    render(<DataTable data={testData} columns={testColumns} />);
    fireEvent.click(screen.getByText('Score'));
    const cells = screen.getAllByRole('cell');
    // Score column is index 2 of each row, sorted asc: 70, 85, 90
    const scores = cells.filter((_, i) => i % 3 === 2).map((c) => c.textContent);
    expect(scores).toEqual(['70', '85', '90']);
  });

  it('toggles sort direction on second click', () => {
    render(<DataTable data={testData} columns={testColumns} />);
    fireEvent.click(screen.getByText('Score'));
    fireEvent.click(screen.getByText('Score'));
    const cells = screen.getAllByRole('cell');
    const scores = cells.filter((_, i) => i % 3 === 2).map((c) => c.textContent);
    expect(scores).toEqual(['90', '85', '70']);
  });

  it('filters rows when searchable', () => {
    render(<DataTable data={testData} columns={testColumns} searchable />);
    const input = screen.getByPlaceholderText('Search…');
    fireEvent.change(input, { target: { value: 'alpha' } });
    expect(screen.getByText('Alpha')).toBeTruthy();
    expect(screen.queryByText('Beta')).toBeNull();
  });

  it('paginates data', () => {
    render(<DataTable data={testData} columns={testColumns} pageSize={2} />);
    // Page 1 shows 2 rows
    expect(screen.getByText('Alpha')).toBeTruthy();
    expect(screen.getByText('Beta')).toBeTruthy();
    expect(screen.queryByText('Gamma')).toBeNull();
    // Navigate to page 2
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Gamma')).toBeTruthy();
    expect(screen.queryByText('Alpha')).toBeNull();
  });

  it('calls onRowClick when a row is clicked', () => {
    const onClick = vi.fn();
    render(<DataTable data={testData} columns={testColumns} onRowClick={onClick} />);
    fireEvent.click(screen.getByText('Alpha'));
    expect(onClick).toHaveBeenCalledWith(testData[0]);
  });

  it('supports custom render function', () => {
    const cols: Column<TestRow>[] = [
      { header: 'Name', accessor: 'name', render: (v) => <strong>{String(v)}</strong> },
    ];
    render(<DataTable data={testData} columns={cols} />);
    const strong = screen.getByText('Alpha');
    expect(strong.tagName).toBe('STRONG');
  });
});

// ── FilterBar ──────────────────────────────────────────

describe('FilterBar', () => {
  const filters: FilterDefinition[] = [
    {
      key: 'area',
      label: 'Business Area',
      type: 'select',
      options: [
        { label: 'Retail', value: 'retail' },
        { label: 'Corporate', value: 'corporate' },
      ],
    },
    { key: 'search', label: 'Search', type: 'text', placeholder: 'Search…' },
    { key: 'active', label: 'Active only', type: 'toggle' },
  ];

  const defaultValues: FilterState = { area: '', search: '', active: false };

  it('renders all filter types', () => {
    const onChange = vi.fn();
    render(<FilterBar filters={filters} values={defaultValues} onChange={onChange} />);
    expect(screen.getByLabelText('Business Area')).toBeTruthy();
    expect(screen.getByPlaceholderText('Search…')).toBeTruthy();
    expect(screen.getByLabelText('Active only')).toBeTruthy();
  });

  it('calls onChange when select changes', () => {
    const onChange = vi.fn();
    render(<FilterBar filters={filters} values={defaultValues} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Business Area'), {
      target: { value: 'retail' },
    });
    expect(onChange).toHaveBeenCalledWith({ ...defaultValues, area: 'retail' });
  });

  it('calls onChange when text input changes', () => {
    const onChange = vi.fn();
    render(<FilterBar filters={filters} values={defaultValues} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText('Search…'), {
      target: { value: 'test' },
    });
    expect(onChange).toHaveBeenCalledWith({ ...defaultValues, search: 'test' });
  });

  it('calls onChange when toggle changes', () => {
    const onChange = vi.fn();
    render(<FilterBar filters={filters} values={defaultValues} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Active only'));
    expect(onChange).toHaveBeenCalledWith({ ...defaultValues, active: true });
  });

  it('shows clear all button when filters are active', () => {
    const onChange = vi.fn();
    const active: FilterState = { area: 'retail', search: '', active: false };
    render(<FilterBar filters={filters} values={active} onChange={onChange} />);
    expect(screen.getByText('Clear all')).toBeTruthy();
  });

  it('hides clear all button when no filters active', () => {
    const onChange = vi.fn();
    render(<FilterBar filters={filters} values={defaultValues} onChange={onChange} />);
    expect(screen.queryByText('Clear all')).toBeNull();
  });

  it('clears all filters on clear all click', () => {
    const onChange = vi.fn();
    const active: FilterState = { area: 'retail', search: 'x', active: true };
    render(<FilterBar filters={filters} values={active} onChange={onChange} />);
    fireEvent.click(screen.getByText('Clear all'));
    expect(onChange).toHaveBeenCalledWith({ area: '', search: '', active: false });
  });
});
