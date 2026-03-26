import { Link, useParams, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface Crumb {
  label: string;
  to: string;
}

export function Breadcrumbs() {
  const { themeId, auId, obligationId } = useParams();
  const location = useLocation();

  const crumbs: Crumb[] = [{ label: 'Enterprise', to: '/dashboard' }];

  if (themeId) {
    crumbs.push({ label: `Theme ${themeId}`, to: `/dashboard/theme/${themeId}` });
  }

  if (auId) {
    crumbs.push({ label: `AU ${auId}`, to: `/dashboard/au/${auId}` });
  }

  if (obligationId) {
    crumbs.push({
      label: `Obligation ${obligationId}`,
      to: `/dashboard/au/${auId}/obligation/${obligationId}`,
    });
  }

  // Non-dashboard pages
  if (location.pathname.startsWith('/comparison')) {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 px-4 py-2 text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground">Enterprise</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Comparison</span>
      </nav>
    );
  }

  if (location.pathname.startsWith('/compliance')) {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 px-4 py-2 text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground">Enterprise</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">RBI Compliance</span>
      </nav>
    );
  }

  if (location.pathname.startsWith('/materiality')) {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 px-4 py-2 text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground">Enterprise</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Materiality</span>
      </nav>
    );
  }

  if (location.pathname.startsWith('/scenarios')) {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 px-4 py-2 text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground">Enterprise</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Scenarios</span>
      </nav>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 px-4 py-2 text-sm text-muted-foreground">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.to} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            {isLast ? (
              <span className="text-foreground">{crumb.label}</span>
            ) : (
              <Link to={crumb.to} className="hover:text-foreground">
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
