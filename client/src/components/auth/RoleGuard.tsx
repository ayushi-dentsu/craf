import { getUser } from '../../services/auth.service';

interface RoleGuardProps {
  /** Roles allowed to see this content */
  allowedRoles: string[];
  children: React.ReactNode;
  /** If true, renders children as disabled instead of hiding */
  disableOnly?: boolean;
}

/**
 * Conditionally renders children based on the current user's role.
 * - By default, hides content if user lacks the required role.
 * - With `disableOnly`, wraps children in a disabled container instead.
 */
export function RoleGuard({ allowedRoles, children, disableOnly = false }: RoleGuardProps) {
  const user = getUser();
  const hasAccess = user && allowedRoles.includes(user.role);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (disableOnly) {
    return (
      <div className="pointer-events-none opacity-50" aria-disabled="true">
        {children}
      </div>
    );
  }

  return null;
}
