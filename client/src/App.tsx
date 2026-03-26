import { Routes, Route, Navigate } from 'react-router-dom';
import { PeriodProvider } from './hooks/usePeriod';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ThemeDetailPage } from './pages/ThemeDetailPage';
import { AUDetailView } from './components/risk-assessment/AUDetailView';
import { ObligationDetailPage } from './pages/ObligationDetailPage';
import { CompliancePage } from './pages/CompliancePage';
import { ComparisonPage } from './pages/ComparisonPage';
import { ScenariosPage } from './pages/ScenariosPage';
import { MaterialityAssessmentPage } from './pages/MaterialityAssessmentPage';

function App() {
  return (
    <PeriodProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/theme/:themeId" element={<ThemeDetailPage />} />
          <Route path="/dashboard/au/:auId" element={<AUDetailView />} />
          <Route path="/dashboard/au/:auId/obligation/:obligationId" element={<ObligationDetailPage />} />
          <Route path="/dashboard/obligation/:obligationId" element={<ObligationDetailPage />} />
          <Route path="/compliance/rbi" element={<CompliancePage />} />
          <Route path="/comparison/yoy" element={<ComparisonPage />} />
          <Route path="/scenarios" element={<ScenariosPage />} />
          <Route path="/materiality" element={<MaterialityAssessmentPage />} />
        </Route>
      </Routes>
    </PeriodProvider>
  );
}

export default App;
