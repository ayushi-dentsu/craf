import { cn } from '../../lib/utils';

type BadgeVariant = 'red' | 'orange' | 'yellow' | 'lime' | 'green' | 'gray';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  compact?: boolean;
  className?: string;
}

const ratingToVariant: Record<string, BadgeVariant> = {
  'Extremely High': 'red',
  'Significant Improvement Needed': 'red',
  'No Control': 'red',
  'Very High': 'orange',
  'Improvement Needed': 'orange',
  'High': 'yellow',
  'Partially Effective': 'yellow',
  'Medium': 'yellow',
  'Minor': 'lime',
  'Meets Requirement': 'lime',
  'Low': 'lime',
  'Insignificant': 'green',
  'Well Controlled': 'green',
  'Effective': 'green',
  'Negligible': 'green',
  'Significantly Effective Control': 'green',
  'Effective Control': 'green',
};

const variantStyles: Record<BadgeVariant, string> = {
  red: 'bg-red-100 text-red-800',
  orange: 'bg-orange-100 text-orange-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  lime: 'bg-lime-100 text-lime-800',
  green: 'bg-green-100 text-green-800',
  gray: 'bg-gray-100 text-gray-800',
};

export function Badge({ label, variant, compact, className }: BadgeProps) {
  const resolved = variant ?? ratingToVariant[label] ?? 'gray';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        compact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        variantStyles[resolved],
        className
      )}
    >
      {label}
    </span>
  );
}
