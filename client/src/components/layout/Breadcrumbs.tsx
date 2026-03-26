import { Link, useParams, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { get } from '../../services/api';

interface Crumb {
  label: string;
  to: string;
}

/** Lightweight fetch for breadcrumb labels — returns just the name */
function useAUName(auId: number | undefined) {
  return useQuery({
    queryKey: ['breadcrumb', 'au', auId],
    queryFn: () => get<{ name: string; themeId: number; themeName: string }>(`/assessment-units/${auId}`),
    enabled: !!auId,
    staleTime: 10 * 60 * 1000,
  });
}

function useThemeName(themeId: number | undefined) {
  return useQuery({
    queryKey: ['breadcrumb', 'theme', themeId],
    queryFn: () => get<{ name: string }>(`/themes/${themeId}/detail`).then((d: any) => ({ name: d?.theme?.name ?? `Theme ${themeId}` })),
    enabled: !!themeId,
    staleTime: 10 * 60 * 1000,
  });
}

export function Breadcrumbs() {
  const { themeId, auId, obligationId } = useParams();
  const location = useLocation();

  const auIdNum = auId ? Number(auId) : undefined;
  const themeIdNum = themeId ? Number(themeId) : undefined;

  const { data: auData } = useAUName(auIdNum);
  const { data: themeData } = useThemeName(themeIdNum);

  const crumbs: Crumb[] = [{ label: 'Enterprise', to: '/dashboard' }];

  if (themeIdNum) {
    crumbs.push({
      label: themeData?.name ?? `Theme ${themeId}`,
      to: `/dashboard/theme/${themeId}`,
    });
  }

  if (auIdNum) {
    crumbs.push({
      label: auData?.name ?? `AU ${auId}`,
      to: `/dashboard/au/${auId}`,
    });
  }

  if (obligationId) {
    const obPath = auId
      ? `/dashboard/au/${auId}/obligation/${obligationId}`
      : `/dashboard/obligation/${obligationId}`;
    crumbs.push({ label: `Obligation ${obligationId}`, to: obPath });
  }

  // Non-dashboard pages
  const staticPages: Record<string, string> = {
    '/comparison': 'Comparison',
    '/compliance': 'RBI Compliance',
    '/materiality': 'Materiality',
    '/scenarios': 'Scenarios',
  };

  for (const [prefix, label] of Object.entries(staticPages)) {
    if (location.pathname.startsWith(prefix)) {
      return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 px-4 py-2 text-sm text-muted-foreground">
          <Link to="/dashboard" className="hover:text-foreground">Enterprise</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{label}</span>
        </nav>
      );
    }
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
