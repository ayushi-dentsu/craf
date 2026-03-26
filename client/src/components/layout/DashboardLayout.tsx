import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Breadcrumbs } from './Breadcrumbs';
import { ErrorBoundary } from '../shared/ErrorBoundary';

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex flex-1 flex-col overflow-hidden">
          <Breadcrumbs />
          <div className="flex-1 overflow-auto p-4">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
          <footer className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
            <span>Last Updated: {new Date().toLocaleDateString()}</span>
            <span className="mx-2">|</span>
            <span>Data As Of: FY 2024-25</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
