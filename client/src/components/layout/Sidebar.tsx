import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  SlidersHorizontal,
  Scale,
  FlaskConical,
  Landmark,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/au', label: 'Risk Assessment', icon: ShieldAlert, end: false },
  { to: '/compliance/rbi', label: 'Compliance', icon: Scale },
  { to: '/comparison/yoy', label: 'Comparison', icon: SlidersHorizontal },
  { to: '/scenarios/1', label: 'Scenarios', icon: FlaskConical },
  { to: '/materiality', label: 'Materiality', icon: Landmark },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-card transition-all duration-200',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      <nav className="flex-1 py-4" role="navigation" aria-label="Main navigation">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end !== false}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <button
        onClick={onToggle}
        className="flex items-center justify-center border-t border-border p-3 text-muted-foreground hover:text-foreground"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
