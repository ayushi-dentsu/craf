import { cn } from '../../lib/utils';

type TrafficLightColor = 'red' | 'yellow' | 'green';

interface TrafficLightProps {
  color: TrafficLightColor;
  label?: string;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorStyles: Record<TrafficLightColor, string> = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-400',
  green: 'bg-green-500',
};

const sizeStyles: Record<string, string> = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3.5 w-3.5',
  lg: 'h-5 w-5',
};

export function TrafficLight({
  color,
  label,
  pulse = false,
  size = 'md',
  className,
}: TrafficLightProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-2', className)}
      role="status"
      aria-label={label ?? `${color} indicator`}
    >
      <span
        className={cn(
          'inline-block rounded-full',
          colorStyles[color],
          sizeStyles[size],
          pulse && 'animate-pulse'
        )}
      />
      {label && <span className="text-sm text-foreground">{label}</span>}
    </span>
  );
}
