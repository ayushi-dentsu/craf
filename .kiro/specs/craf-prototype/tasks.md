# Implementation Plan: Converged Risk Assessment Framework (CRAF)

## Overview

This plan implements the CRAF prototype in phases: infrastructure and data model first, then the core calculation engine, API layer, frontend components, seed data, and finally integration testing. MVP1 (Requirements 1-33) is the primary scope. MVP2 and MVP3 tasks are included as future/optional items. The tech stack is React.js + TypeScript, Node.js + Express.js, PostgreSQL + Prisma, Tailwind CSS + Shadcn/ui, Recharts, Vitest + fast-check.

## Tasks

- [x] 1. Project scaffolding and database schema
  - [x] 1.1 Initialize monorepo with client (Vite + React + TypeScript) and server (Node.js + Express + TypeScript) directories
    - Create `client/` with Vite React-TS template, install Tailwind CSS, Shadcn/ui, Recharts, React Router v6, TanStack Query
    - Create `server/` with Express + TypeScript, install Prisma, jsonwebtoken, bcryptjs
    - Create shared `tsconfig` and root `package.json` with workspace scripts
    - _Requirements: 28.1_

  - [x] 1.2 Define Prisma schema with all database models
    - Create `server/prisma/schema.prisma` with all models: Theme, AssessmentUnit, AUThemeMapping, ComplianceObligation, Control, AssessmentPeriod, InherentRisk, ControlQuality, ControlPerformance, ControlEnvironmentRating, ResidualRisk, RatingOverride, AUVolumeDefinition, AUSystemComplexity, AUProductComplexity, User, RolePermission, MaterialityAssessment
    - Define all relations, unique constraints, and column mappings per the design ERD
    - Run `npx prisma migrate dev` to generate initial migration
    - _Requirements: 1.2, 2.1, 3.2, 28.1_

  - [x] 1.3 Create shared TypeScript types and interfaces
    - Create `server/src/types/` with interfaces for all API response shapes: ExecutiveDashboardResponse, AUDetailResponse, ApiErrorResponse
    - Create enums for business areas, risk ratings, control types, CQA/CPA categories, roles
    - Create `client/src/types/` mirroring the API response types
    - _Requirements: 28.2_

- [x] 2. Checkpoint — Ensure project builds and Prisma migration runs
  - Ensure all tests pass, ask the user if questions arise.

- [-] 3. Risk Calculation Engine — Likelihood and Impact
  - [x] 3.1 Implement likelihood parameter scoring functions
    - Create `server/src/services/risk-calculator/likelihood.service.ts`
    - Implement scoring functions for all 6 parameters: volume growth (5 bands), complexity (max of product/system), regulatory returns (5 bands), compliance breaches (3 bands), ICOFR failures (3 bands), customer complaints (5 bands)
    - Implement average calculation and scaling table (raw avg → {5,10,15,20,25})
    - Implement rating mapping (25→Almost Certain, 20→Likely, 15→Possible, 10→Unlikely, 5→Rare)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

  - [ ]* 3.2 Write property tests for likelihood scoring
    - **Property 1: Likelihood parameter scoring bands** — verify each parameter score ∈ {5,10,15,20,25} and matches band thresholds
    - **Validates: Requirements 4.2, 4.4, 4.5, 4.6, 4.7**

  - [ ]* 3.3 Write property test for likelihood scaling and rating
    - **Property 2: Likelihood scaling and rating** — verify scaled score matches scaling table and rating matches score-to-rating mapping
    - **Validates: Requirements 4.8, 4.9**

  - [x] 3.4 Implement system complexity scoring
    - Create `server/src/services/risk-calculator/system-complexity.service.ts`
    - Implement scoring for 3 parameters: interfaces (5 bands), tier (4 values), change requests (5 bands)
    - Implement weighted average calculation and rounding to next multiple of 5
    - Implement multi-system averaging and scaling for AUs with multiple systems
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ]* 3.5 Write property test for system complexity
    - **Property 6: System complexity weighted average and rounding** — verify weighted avg rounds to next multiple of 5, multi-system averaging scales correctly
    - **Validates: Requirements 7.5, 7.6**

  - [x] 3.6 Implement product complexity scoring
    - Create `server/src/services/risk-calculator/product-complexity.service.ts`
    - Implement multiplication of 5 params (or 4 for Ops/Support excluding product variants)
    - Implement categorization thresholds for Business Groups vs Ops/Support Groups
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 3.7 Write property test for product complexity
    - **Property 7: Product complexity calculation and categorization** — verify raw score = product of params, category matches thresholds for AU type
    - **Validates: Requirements 8.3, 8.4, 8.5, 8.6**

  - [ ]* 3.8 Write property test for complexity max
    - **Property 3: Complexity score is max of product and system complexity** — verify complexity param = max(product, system)
    - **Validates: Requirements 4.3**

  - [x] 3.9 Implement impact scoring
    - Create `server/src/services/risk-calculator/impact.service.ts`
    - Implement scoring for 4 parameters: business impact (5 bands), media coverage (4 bands), financial penalty (2 values), G/L impact (3 values)
    - Implement overall impact = max of 4 parameter scores
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 3.10 Write property test for impact scoring
    - **Property 4: Impact score is max of four parameters** — verify overall impact = max(business, media, penalty, GL)
    - **Validates: Requirements 5.6**

  - [x] 3.11 Implement inherent risk calculation
    - Create `server/src/services/risk-calculator/inherent-risk.service.ts`
    - Implement IR = likelihood × impact
    - Implement rating thresholds: ≥375→Extremely High, ≥200→Very High, ≥100→High, ≥25→Minor, <25→Insignificant
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 3.12 Write property test for inherent risk
    - **Property 5: Inherent risk score and rating** — verify IR = likelihood × impact and rating matches thresholds
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6**

- [-] 4. Risk Calculation Engine — Control Assessment
  - [x] 4.1 Implement CQA calculator
    - Create `server/src/services/risk-calculator/cqa.service.ts`
    - Implement CQA raw = monitoring × automation × type × documentation
    - Implement scaling: <9→5, ≥9&<81→10, ≥81&<225→15, ≥225&<500→20, ≥500→25
    - Implement category assignment
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

  - [ ]* 4.2 Write property test for CQA
    - **Property 10: CQA raw score and scaling** — verify raw = product of 4 params, scaled score matches thresholds
    - **Validates: Requirements 10.6, 10.7, 10.8**

  - [x] 4.3 Implement CQI calculator
    - Create `server/src/services/risk-calculator/cqi.service.ts`
    - Implement weighted average CQA with category weights (No Control 100%, <15→80%, ≥15&<30→60%, ≥30&<60→40%, ≥60&<125→30%, =125→20%)
    - Implement CQI = 100% − weighted avg
    - Implement interpretation scoring (<40%→1, ≥40%→4, ≥60%→9, ≥70%→16, ≥80%→25)
    - _Requirements: 11.1, 11.2, 11.3_

  - [ ]* 4.4 Write property test for CQI
    - **Property 11: CQI calculation and interpretation** — verify weighted avg uses correct weights, CQI = 100% − avg, interpretation matches thresholds
    - **Validates: Requirements 11.1, 11.2, 11.3**

  - [x] 4.5 Implement CPA calculator
    - Create `server/src/services/risk-calculator/cpa.service.ts`
    - Implement KCI/Self-Assessment scoring matrix for Compliance controls (5 scenarios) and ICOFR/Converged controls (6 scenarios)
    - Implement control testing scoring: Pass→5, Pass with Exception→3, Fail→1, Not Tested→5
    - Implement CPA raw = KCI/SA score × testing score
    - Implement scaling: 1→5, 3→5, 5→5, 9→10, 15→15, 25→25
    - _Requirements: 12.1-12.12, 13.1, 13.2, 13.3, 13.4_

  - [ ]* 4.6 Write property test for CPA
    - **Property 12: CPA scoring matrix** — verify KCI/SA score matches matrix, testing score matches mapping, raw = product, scaled matches thresholds
    - **Validates: Requirements 12.1-12.12, 13.1, 13.2, 13.3, 13.4**

  - [x] 4.7 Implement CPI calculator
    - Create `server/src/services/risk-calculator/cpi.service.ts`
    - Implement weighted average CPA with category weights (No Control 100%, ≥5&<45→80%, ≥45&<225→60%, ≥225&<250→40%, ≥250&<375→30%, ≥375→20%)
    - Implement CPI = 100% − weighted avg and interpretation scoring
    - _Requirements: 14.1, 14.2, 14.3_

  - [ ]* 4.8 Write property test for CPI
    - **Property 13: CPI calculation and interpretation** — verify weighted avg uses correct weights, CPI = 100% − avg, interpretation matches thresholds
    - **Validates: Requirements 14.1, 14.2, 14.3**

  - [x] 4.9 Implement CER calculator
    - Create `server/src/services/risk-calculator/cer.service.ts`
    - Implement CER = CQI interp score × CPI interp score
    - Implement rating: <15→Significant Improvement Needed, ≥15&<30→Improvement Needed, ≥30&<60→Partially Effective, ≥60&<125→Meets Requirement, ≥125→Effective
    - _Requirements: 15.1, 15.2_

  - [ ]* 4.10 Write property test for CER
    - **Property 14: CER calculation and rating** — verify CER = CQI × CPI, rating matches thresholds
    - **Validates: Requirements 15.1, 15.2**

  - [x] 4.11 Implement residual risk calculator
    - Create `server/src/services/risk-calculator/residual-risk.service.ts`
    - Implement RR = IR ÷ CER with CER=0 edge case handling (assign "No Control" rating, no division)
    - Implement rating thresholds: ≥6.67→Significant Improvement Needed, <6.67&>2→Improvement Needed, ≤2&>1→Meets Requirement, ≤1→Well Controlled
    - Implement aggregation: weighted sum of category counts ÷ total controls
    - Implement aggregate rating: ≥70%→Extremely High, ≥45%→High, >5%→Medium, >1%→Low, ≤1%→Negligible
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 17.1, 17.2, 17.3, 32.1_

  - [ ]* 4.12 Write property tests for residual risk
    - **Property 15: Residual risk calculation and rating** — verify RR = IR ÷ CER, rating matches thresholds, CER=0 → "No Control"
    - **Property 16: Residual risk aggregation** — verify aggregate = sum(count × weight) ÷ total, rating matches thresholds
    - **Validates: Requirements 16.1-16.6, 17.1-17.3, 32.1**

  - [x] 4.13 Implement materiality calculator
    - Create `server/src/services/materiality.service.ts`
    - Implement revenue materiality = PBT × 0.05, BS materiality = totalAssets × 0.005
    - Implement haircut application: final = computed × (1 − haircut/100)
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 4.14 Write property test for materiality
    - **Property 8: Materiality calculation correctness** — verify revenue = PBT × 0.05, BS = assets × 0.005, final = computed × (1 − haircut/100)
    - **Validates: Requirements 9.1, 9.2, 9.3**

  - [x] 4.15 Create risk calculator orchestrator
    - Create `server/src/services/risk-calculator/index.ts`
    - Implement full recalculation pipeline: likelihood → impact → IR → CQA → CQI → CPA → CPI → CER → RR → aggregation
    - Implement score clamping for out-of-bounds values with warning logging
    - _Requirements: 32.4_

- [x] 5. Checkpoint — Ensure all calculation engine tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Authentication and RBAC middleware
  - [x] 6.1 Implement authentication service and login endpoint
    - Create `server/src/services/auth.service.ts` with JWT token generation/validation
    - Create `server/src/routes/auth.routes.ts` with POST `/api/auth/login`
    - Implement password hash verification with bcryptjs
    - _Requirements: 28.3, 29.2_

  - [x] 6.2 Implement RBAC middleware
    - Create `server/src/middleware/rbac.middleware.ts`
    - Implement `authorize(resource, action)` middleware factory
    - Implement role-permission lookup: extract role from JWT, check permissions table
    - Implement scope enforcement: 'all' allows, 'assigned' checks user.assignedAuIds, 'own' checks entity creator
    - Return 403 Forbidden when permission denied
    - _Requirements: 31.1, 31.2, 31.3, 31.4, 31.5, 31.7_

  - [ ]* 6.3 Write property test for RBAC enforcement
    - **Property 27: RBAC middleware enforcement** — verify allow iff role-permission matrix grants access, AUHead restricted to assigned AUs
    - **Validates: Requirements 31.1, 31.2, 31.3, 31.4, 31.5**

  - [x] 6.4 Implement error handling middleware
    - Create `server/src/middleware/error-handler.middleware.ts`
    - Implement structured error response format: { status, code, message, details, timestamp }
    - Handle validation errors (400), auth errors (401), RBAC errors (403), not found (404), calculation edge cases (422), server errors (500)
    - _Requirements: 32.2, 32.3, 32.5_

  - [ ]* 6.5 Write property test for error responses
    - **Property 28: Structured API error responses** — verify all error responses contain status code, error code, and message
    - **Validates: Requirements 32.2, 32.5**

  - [x] 6.6 Implement validation middleware
    - Create `server/src/middleware/validation.middleware.ts`
    - Implement request payload validation against defined schemas
    - Reject malformed requests with 400 status codes
    - _Requirements: 32.5_

- [x] 7. API Routes — Core Data Endpoints
  - [x] 7.1 Implement assessment unit routes
    - Create `server/src/routes/assessment-units.routes.ts`
    - GET `/api/assessment-units` — list with filters (businessArea, themeId, isActive)
    - GET `/api/assessment-units/:auId` — basic AU info
    - GET `/api/assessment-units/:auId/detail` — full AU detail with risk data (periodId query param)
    - GET `/api/assessment-units/:auId/volume-definition` — volume definition
    - Apply RBAC middleware: AUHead restricted to assigned AUs
    - _Requirements: 1.5, 30.3_

  - [x] 7.2 Implement theme and obligation routes
    - Create `server/src/routes/themes.routes.ts` — GET `/api/themes`, GET `/api/themes/:themeId/assessment-units`
    - Create `server/src/routes/compliance.routes.ts` — obligations listing with controls, sorted by criticality
    - _Requirements: 2.3, 2.4_

  - [ ]* 7.3 Write property tests for data invariants
    - **Property 29: Obligation-to-theme mapping invariant** — verify each obligation maps to exactly one of 21 themes
    - **Property 30: Assessment Unit business area invariant** — verify each AU has valid business area
    - **Property 32: Obligations sorted by criticality** — verify API returns obligations sorted Critical > High > Medium > Low
    - **Validates: Requirements 1.3, 2.3, 2.4**

  - [x] 7.4 Implement control routes
    - Create `server/src/routes/controls.routes.ts`
    - GET `/api/controls` — list with filters (auId, obligationId)
    - GET `/api/controls/:controlId` — control detail
    - GET `/api/controls/:controlId/quality` — CQA detail
    - GET `/api/controls/:controlId/performance` — CPA detail
    - GET `/api/control-environment/:auId` — CER with CQI/CPI breakdown
    - _Requirements: 3.3, 15.3_

  - [x] 7.5 Implement risk assessment routes
    - Create `server/src/routes/inherent-risk.routes.ts` — GET and POST `/api/inherent-risk`
    - Create `server/src/routes/residual-risk.routes.ts` — GET `/api/residual-risk`, GET `/api/residual-risk/aggregate`
    - _Requirements: 6.7, 17.4_

  - [x] 7.6 Implement comparison and early warning routes
    - Create `server/src/routes/comparison.routes.ts` — GET `/api/comparison/year-over-year`, GET `/api/comparison/before-after`
    - Create `server/src/routes/early-warnings.routes.ts` — GET `/api/early-warnings`, GET `/api/early-warnings/:auId`
    - _Requirements: 21.4_

  - [x] 7.7 Implement rating override routes
    - Create `server/src/routes/rating-overrides.routes.ts`
    - POST `/api/rating-overrides` — create override (require reason, store original/overridden rating, officer, timestamp)
    - GET `/api/rating-overrides` — list with filters (auId, periodId)
    - Trigger downstream recalculation on override
    - _Requirements: 18.1, 18.2, 18.3_

  - [ ]* 7.8 Write property tests for override and recalculation
    - **Property 17: Rating override triggers downstream recalculation** — verify aggregation uses overridden rating
    - **Property 31: Override requires reason** — verify rejection when reason is empty
    - **Validates: Requirements 18.1, 18.3**

  - [x] 7.9 Implement materiality routes
    - Create `server/src/routes/materiality.routes.ts`
    - GET `/api/materiality` — get materiality assessment for period
    - POST `/api/materiality` — create/update materiality assessment
    - GET `/api/materiality/significant-accounts` — significant accounts list
    - _Requirements: 33.1_

  - [x] 7.10 Implement Express app entry point and route wiring
    - Create `server/src/index.ts` — Express app setup, middleware chain, route mounting
    - Wire all routes under `/api` prefix
    - Apply auth middleware, error handler, CORS
    - _Requirements: 28.2, 28.3_

- [x] 8. Dashboard Service Layer
  - [x] 8.1 Implement executive dashboard service
    - Create `server/src/services/dashboard-service/executive.service.ts`
    - Aggregate KPIs: overall residual risk score, high/critical risks count, control effectiveness %, compliance breach trend
    - Build heatmap data: all AUs with residual risk rating, color mapping, early warning flags
    - Build trend data: quarterly residual risk and control effectiveness over 2 years
    - Build risk distribution by theme and controls by effectiveness category
    - _Requirements: 19.1, 19.2, 19.3, 19.6, 19.7_

  - [ ]* 8.2 Write property test for heatmap color mapping
    - **Property 18: Heatmap color mapping** — verify color matches rating (Extremely High→Red, Very High→Orange, High→Yellow, Minor→Light Green, Insignificant→Green)
    - **Validates: Requirements 19.2**

  - [ ]* 8.3 Write property test for dashboard filtering
    - **Property 19: Dashboard filtering returns matching results** — verify all returned AUs match active filters, no matching AUs excluded
    - **Validates: Requirements 19.7, 19.8**

  - [x] 8.4 Implement AU detail service
    - Create `server/src/services/dashboard-service/au-detail.service.ts`
    - Assemble full AU detail: inherent risk breakdown, control environment (CQI/CPI/CER), residual risk with previous period comparison, obligations with controls
    - _Requirements: 20.3_

  - [x] 8.5 Implement comparison service
    - Create `server/src/services/dashboard-service/comparison.service.ts`
    - Year-over-year: side-by-side metrics with delta percentages, color-coded deterioration/improvement
    - Before/after: split-screen data for control changes showing CQI/CPI/CER/RR impact
    - _Requirements: 21.1, 21.2, 21.3_

  - [ ]* 8.6 Write property test for YoY delta
    - **Property 20: Year-over-year delta calculation** — verify delta = ((current − previous) / previous) × 100
    - **Validates: Requirements 21.1, 21.2**

  - [x] 8.7 Implement early warning service
    - Create `server/src/services/dashboard-service/early-warning.service.ts`
    - Deteriorating risk trend: flag AUs where aggregate residual risk increased >10% vs previous period
    - Approaching failure: flag controls where CPA decreased across consecutive periods
    - Breach trend: flag AUs with increasing compliance breaches over consecutive periods
    - Traffic light indicators: Red/Yellow/Green
    - _Requirements: 22.1, 22.2, 22.3, 22.4_

  - [ ]* 8.8 Write property tests for early warnings
    - **Property 21: Early warning — deteriorating risk trend** — verify flag when residual risk increase >10%
    - **Property 22: Early warning — approaching failure threshold** — verify flag when CPA decreasing across periods
    - **Property 23: Early warning — breach trend** — verify flag when breaches increasing
    - **Validates: Requirements 22.1, 22.2, 22.3**

  - [x] 8.9 Implement RBI compliance service
    - Create `server/src/services/dashboard-service/compliance.service.ts`
    - Overall compliance score: (obligations in compliance ÷ total) × 100
    - Regulatory returns status table
    - Recent breaches (last 90 days)
    - Upcoming deadlines
    - 12-month compliance trend
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5_

  - [ ]* 8.10 Write property tests for RBI compliance
    - **Property 24: RBI compliance score calculation** — verify score = (compliant ÷ total) × 100
    - **Property 25: Recent breaches filtered to 90 days** — verify only breaches within 90 days returned
    - **Validates: Requirements 23.1, 23.3**

  - [x] 8.11 Implement dashboard routes
    - Create `server/src/routes/dashboard.routes.ts`
    - GET `/api/dashboard/executive` — full executive dashboard data
    - GET `/api/dashboard/executive/kpis` — KPI cards only
    - GET `/api/dashboard/executive/heatmap` — heatmap with filters
    - GET `/api/dashboard/executive/trends` — trend charts
    - GET `/api/dashboard/rbi-compliance` — RBI compliance dashboard
    - _Requirements: 28.3_

- [x] 9. Checkpoint — Ensure all backend tests pass and API endpoints respond
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Frontend — Layout, Auth, and Navigation
  - [x] 10.1 Implement app layout and routing
    - Create `client/src/components/layout/DashboardLayout.tsx` — sidebar, header, main content area, footer
    - Create `client/src/components/layout/Sidebar.tsx` — navigation items: Dashboard, Risk Assessment, Controls, Compliance, Scenarios, Materiality
    - Create `client/src/components/layout/Header.tsx` — CRAF logo, period selector, view toggle (realtime/periodic), user menu
    - Create `client/src/components/layout/Breadcrumbs.tsx` — reads route params, renders clickable breadcrumb trail
    - Set up React Router v6 with all page routes per design
    - _Requirements: 20.1, 20.2, 28.1_

  - [x] 10.2 Implement authentication pages and route guards
    - Create `client/src/components/auth/LoginPage.tsx` — username/password form, JWT token storage
    - Create `client/src/components/auth/ProtectedRoute.tsx` — redirect to login if no token
    - Create `client/src/components/auth/RoleGuard.tsx` — check user role against required permissions, hide/disable unauthorized elements
    - Create `client/src/services/auth.service.ts` — login API call, token management
    - _Requirements: 29.2, 31.6_

  - [x] 10.3 Implement API client service layer
    - Create `client/src/services/api.ts` — base Axios/fetch client with JWT header injection, error handling
    - Create service files for each API domain: `dashboard.service.ts`, `assessment-units.service.ts`, `controls.service.ts`, `risk.service.ts`, `comparison.service.ts`, `materiality.service.ts`
    - Set up TanStack Query provider and custom hooks
    - _Requirements: 28.2_

  - [x] 10.4 Implement frontend error boundaries
    - Create `client/src/components/shared/ErrorBoundary.tsx` — catches render errors, displays "Something went wrong. Please refresh."
    - Wrap each major section with error boundary
    - No stack traces exposed; console logging in dev mode only
    - _Requirements: 32.3_

- [x] 11. Frontend — Executive Dashboard
  - [x] 11.1 Implement KPI cards component
    - Create `client/src/components/dashboard/KPICards.tsx`
    - 4 cards: Overall Residual Risk Score (color-coded), High/Critical Risks Count (red badge), Control Effectiveness % (circular gauge), Compliance Breach Trend (sparkline)
    - _Requirements: 19.1_

  - [x] 11.2 Implement risk heatmap component
    - Create `client/src/components/dashboard/RiskHeatmap.tsx`
    - Grid layout of AUs grouped by business area
    - Color-coded cells: Red (#EF4444), Orange (#F97316), Yellow (#EAB308), Light Green (#84CC16), Green (#22C55E)
    - Hover tooltip: AU name, residual risk score, rating
    - Click navigates to AU detail
    - Early warning icon overlay on flagged AUs
    - Filter bar: business area, risk rating, theme
    - _Requirements: 19.2, 19.3, 19.4, 19.8_

  - [x] 11.3 Implement trend charts component
    - Create `client/src/components/dashboard/TrendCharts.tsx`
    - Recharts LineChart with quarterly data points over 2 years
    - Lines for residual risk and control effectiveness
    - Risk distribution by theme bar chart
    - Controls by effectiveness donut chart
    - _Requirements: 19.5, 19.6_

  - [x] 11.4 Implement executive dashboard page
    - Create `client/src/pages/DashboardPage.tsx`
    - Compose KPICards, RiskHeatmap, TrendCharts
    - Support toggling between real-time and periodic views
    - Wire to dashboard API hooks
    - _Requirements: 19.1, 19.7_

- [x] 12. Frontend — Drill-Down Views
  - [x] 12.1 Implement theme-level view
    - Create `client/src/pages/ThemeDetailPage.tsx`
    - Filter heatmap to AUs under selected theme
    - Show theme-level aggregated metrics
    - _Requirements: 20.1_

  - [x] 12.2 Implement AU detail view
    - Create `client/src/components/risk-assessment/AUDetailView.tsx`
    - Three collapsible sections: Inherent Risk (radar/bar chart of 6 likelihood + 4 impact params), Control Environment (CQI donut, CPI donut, CER display), Residual Risk (score with previous period comparison, delta indicator)
    - Create `client/src/components/risk-assessment/LikelihoodBreakdown.tsx` and `ImpactBreakdown.tsx`
    - Obligations table: sortable by criticality, filterable, expandable rows showing controls
    - _Requirements: 20.1, 20.3_

  - [x] 12.3 Implement obligation detail view
    - Create `client/src/pages/ObligationDetailPage.tsx`
    - Show obligation details with associated controls
    - Display CQA and CPA scores per control
    - Individual control residual risk ratings
    - _Requirements: 20.1_

  - [x] 12.4 Implement early warning panel
    - Create `client/src/components/early-warning/EarlyWarningPanel.tsx`
    - List of flagged AUs with traffic light indicators
    - Deteriorating risk: amber triangle, approaching failure: red circle, breach trend: red trending-up
    - Click navigates to relevant AU
    - _Requirements: 22.1, 22.2, 22.3, 22.4_

- [x] 13. Frontend — Comparison, Compliance, and Materiality Views
  - [x] 13.1 Implement year-over-year comparison view
    - Create `client/src/components/comparison/YearOverYearView.tsx`
    - Side-by-side cards: current vs previous period
    - Delta percentages with color coding (red deterioration, green improvement)
    - Available at enterprise, theme, and AU levels
    - _Requirements: 21.1, 21.2_

  - [x] 13.2 Implement before/after comparison view
    - Create `client/src/components/comparison/BeforeAfterView.tsx`
    - Split screen: left = before state, right = after state
    - Show impact on CQI, CPI, CER, and residual risk
    - _Requirements: 21.3_

  - [x] 13.3 Implement RBI compliance dashboard
    - Create `client/src/components/compliance/RBIComplianceDashboard.tsx`
    - Overall compliance score gauge
    - Regulatory returns status table
    - Recent breaches list (last 90 days)
    - Upcoming deadlines
    - 12-month compliance trend line chart
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5_

  - [x] 13.4 Implement materiality assessment page
    - Create `client/src/components/materiality/MaterialityPage.tsx`
    - Financial inputs card: PBT, Total Assets
    - Waterfall visualization: PBT → 5% → Revenue Materiality → 25% Haircut → Final
    - Significant accounts table
    - Tolerable error configuration
    - _Requirements: 33.1, 33.2, 33.3_

  - [x] 13.5 Implement scenario views
    - Create `client/src/components/scenarios/ScenarioSelector.tsx` — select demo scenario 1, 2, or 3
    - Create `client/src/components/scenarios/WhatIfModeler.tsx` — display 3 what-if scenarios with projected outcomes
    - Wire to scenario-specific API data
    - _Requirements: 26.3, 26.4_

- [x] 14. Checkpoint — Ensure frontend components render and connect to API
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Seed Data Generation
  - [x] 15.1 Implement theme and AU seed data
    - Create `server/prisma/seed.ts` entry point
    - Create `server/src/services/seed-data/themes.seed.ts` — 21 themes from Annexure II
    - Create `server/src/services/seed-data/assessment-units.seed.ts` — 89 AUs from Annexure I across 4 business areas
    - Create `server/src/services/seed-data/users.seed.ts` — 8 sample users (one per governance role)
    - _Requirements: 1.1, 1.3, 1.4, 27.1, 27.2, 29.3_

  - [x] 15.2 Implement obligation and control seed data
    - Create `server/src/services/seed-data/obligations.seed.ts` — 100+ compliance obligations mapped across AUs
    - Create `server/src/services/seed-data/controls.seed.ts` — 300+ controls mapped to obligations with varied types
    - _Requirements: 2.2, 3.1, 27.4_

  - [x] 15.3 Implement risk assessment seed data
    - Create `server/src/services/seed-data/risk-data.seed.ts`
    - Generate inherent risk data for 2 assessment periods (FY 2023-24, FY 2024-25)
    - Generate CQA and CPA data for all controls across both periods
    - Compute CQI, CPI, CER, residual risk using the calculation engine
    - Ensure risk distribution: ~10% Extremely High/Very High, ~20% High, ~40% Medium, ~30% Low/Negligible
    - Generate materiality assessment data for both periods
    - _Requirements: 27.3, 27.4, 27.5, 27.6, 33.4_

  - [ ]* 15.4 Write property test for seed data consistency
    - **Property 26: Seed data mathematical consistency** — verify all computed scores follow CRAF formulas (IR = L × I, CQA = product of 4, CQI = 100% − avg, etc.)
    - **Validates: Requirements 27.6**

  - [x] 15.5 Implement demo scenario seed data
    - Create `server/src/services/seed-data/scenario-data.seed.ts`
    - Scenario 1 (Audit Finding Remediation): Trade Finance with IR=300, CQI=40%, deficient LC control (CQA=1), "after" state (CQA=625), recalculated CQI=75%, RR drops 300→120
    - Scenario 2 (Control Failure Investigation): Retail Liabilities with early warning, CPA degraded 25→5, CPI 80%→55%, RR 50→95, 3-month degradation pattern
    - Scenario 3 (New Regulation Impact): Digital Lending affecting 3 AUs with 15 new obligations, 3 what-if scenarios (no controls→Very High, basic→High, comprehensive→Medium)
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 25.1, 25.2, 25.3, 25.4, 26.1, 26.2, 26.3, 26.4_

  - [x] 15.6 Create seed orchestrator and role permissions seed
    - Create `server/src/services/seed-data/index.ts` — runs all seeds in order: periods → themes → AUs → obligations → controls → risk data → scenarios → users → permissions
    - Seed role_permissions table with the full role-permission matrix from design
    - Wire to `prisma db seed` command
    - _Requirements: 31.7_

- [ ] 16. Checkpoint — Ensure seed data populates correctly and demo scenarios work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Integration wiring and final polish
  - [ ] 17.1 Wire frontend pages to backend API
    - Connect all page components to their respective API hooks
    - Ensure drill-down navigation works end-to-end (Enterprise → Theme → AU → Obligation)
    - Ensure breadcrumbs update correctly at each level
    - Verify period selector switches data across views
    - _Requirements: 20.1, 20.2, 20.3_

  - [ ] 17.2 Wire demo scenario flows
    - Ensure Scenario 1 (Audit Finding Remediation) before/after view shows correct data and heatmap color change
    - Ensure Scenario 2 (Control Failure Investigation) early warning and trend chart display correctly
    - Ensure Scenario 3 (New Regulation Impact) what-if modeler shows 3 scenarios with projected outcomes
    - _Requirements: 24.1-24.4, 25.1-25.4, 26.1-26.4_

  - [ ] 17.3 Implement shared UI components
    - Create `client/src/components/shared/DataTable.tsx` — reusable sortable/filterable table
    - Create `client/src/components/shared/Badge.tsx` — risk rating badges with color coding
    - Create `client/src/components/shared/TrafficLight.tsx` — Red/Yellow/Green indicator
    - Create `client/src/components/shared/FilterBar.tsx` — reusable filter bar component
    - _Requirements: 22.4_

  - [ ] 17.4 Performance and response time verification
    - Ensure dashboard views respond within 2 seconds
    - Ensure API endpoints respond within 500 milliseconds
    - Add database indexes on (au_id, period_id) for assessment tables and (theme_id) for obligations
    - _Requirements: 28.4, 28.5_

- [ ] 18. Final checkpoint — Ensure all tests pass and application runs end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 19. MVP2 tasks (future — Production Hardening)
  - [ ]* 19.1 Implement audit trail system
    - Create audit_log table and middleware to intercept write operations
    - Record action type, entity, user, timestamp, before/after values
    - Create audit log page with filters
    - _Requirements: 34.1, 34.2, 34.3, 34.4_

  - [ ]* 19.2 Implement export service
    - PDF generation for dashboard views and board reports
    - CSV export for data tables
    - _Requirements: 35.1, 35.2, 35.3, 35.4_

  - [ ]* 19.3 Implement notification system
    - Notifications table, bell icon with unread count, dropdown list
    - Trigger on early warning, risk rating change, override submission
    - _Requirements: 36.1, 36.2, 36.3, 36.4_

  - [ ]* 19.4 Implement data freshness indicators
    - Display "Last Calculated" and "Data As Of" timestamps on dashboard views
    - Staleness warning when data older than threshold
    - _Requirements: 37.1, 37.2, 37.3_

  - [ ]* 19.5 Implement enhanced scenario comparison
    - Overlay up to 3 scenarios on same chart
    - Save/load scenario configurations
    - _Requirements: 38.1, 38.2, 38.3_

  - [ ]* 19.6 Implement input validation with business rules
    - Zod schemas for all API request bodies
    - CRAF-specific validators for score bands and consistent control attributes
    - _Requirements: 39.1, 39.2, 39.3_

  - [ ]* 19.7 Write property tests for MVP2 features
    - **Property 33: Audit trail records all write operations**
    - **Property 34: Notification on risk rating change**
    - **Property 35: Data freshness staleness warning**
    - **Property 36: Score parameter validation**
    - **Property 37: Scenario configuration round-trip**
    - **Validates: Requirements 34.1, 36.2, 37.1-37.3, 39.1, 38.3**

- [ ] 20. MVP3 tasks (future — Enterprise Polish)
  - [ ]* 20.1 Implement theme customization
    - Light/dark mode toggle, configurable primary/accent colors, user preference persistence
    - _Requirements: 40.1, 40.2, 40.3_

  - [ ]* 20.2 Implement user management
    - CRUD API for users, admin page for GCCO, password complexity and reset
    - _Requirements: 41.1, 41.2, 41.3_

  - [ ]* 20.3 Implement configurable thresholds
    - Configuration page for IR thresholds, RR aggregation weights, materiality parameters
    - Trigger recalculation on config change
    - _Requirements: 42.1, 42.2, 42.3, 42.4_

  - [ ]* 20.4 Implement dashboard personalization
    - Saved filter presets, favorite AUs, last-used view settings
    - _Requirements: 43.1, 43.2, 43.3_

  - [ ]* 20.5 Implement performance optimization
    - API response caching, database query optimization, rate limiting
    - _Requirements: 44.1, 44.2, 44.3, 44.4_

  - [ ]* 20.6 Write property tests for MVP3 features
    - **Property 38: Configurable threshold persistence and recalculation**
    - **Property 39: User preference round-trip**
    - **Property 40: API rate limiting**
    - **Validates: Requirements 42.1-42.4, 40.3, 43.1-43.3, 44.3**

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- MVP1 tasks (1-18) are the primary implementation scope
- MVP2 tasks (19) and MVP3 tasks (20) are future phases
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate the 40 correctness properties from the design document
- All calculation engine functions are pure functions for easy testing
- Seed data generation uses the calculation engine to ensure mathematical consistency
