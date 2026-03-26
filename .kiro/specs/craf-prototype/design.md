# Design Document

## Introduction

This design document describes the technical architecture, data model, component structure, API contracts, and calculation engine for the Converged Risk Assessment Framework (CRAF). The system is a full-fledged product delivered in three phased releases (MVP1, MVP2, MVP3), built as a three-tier web application (React.js frontend, Node.js/Express backend, PostgreSQL database) that implements the complete CRAF methodology for banking institutions. MVP1 serves as the demo-ready foundation showcasing three business scenarios across 89+ Assessment Units, 21 regulatory themes, 100+ compliance obligations, and 300+ controls. MVP2 adds production hardening (audit trail, export, notifications, validation). MVP3 delivers enterprise polish (theming, user management, configurable thresholds, performance optimization).

## Architecture Overview

### System Architecture

The application follows a standard three-tier architecture:

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
│  React.js + TypeScript + Tailwind CSS + Shadcn/ui       │
│  Recharts for visualizations                            │
│  SPA with client-side routing (React Router)            │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/JSON (REST)
┌──────────────────────▼──────────────────────────────────┐
│                   Application Layer                      │
│  Node.js + Express.js + TypeScript                      │
│  ├── API Router (RESTful endpoints)                     │
│  ├── Auth Middleware (JWT + RBAC)                        │
│  ├── RBAC Middleware                                     │
│  ├── Error Handling Middleware                            │
│  ├── Risk Calculation Engine                            │
│  ├── Dashboard Service (aggregation)                    │
│  └── Seed Data Generator                                │
└──────────────────────┬──────────────────────────────────┘
                       │ SQL (pg driver / Prisma ORM)
┌──────────────────────▼──────────────────────────────────┐
│                     Data Layer                           │
│  PostgreSQL                                             │
│  ├── Core tables (AUs, themes, obligations, controls)   │
│  ├── Assessment tables (inherent risk, CQA, CPA, CER)  │
│  ├── Residual risk & aggregation tables                 │
│  ├── Rating overrides & audit trail                     │
│  └── Users & roles                                      │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React.js 18+ with TypeScript | SPA, component-based UI |
| UI Framework | Tailwind CSS + Shadcn/ui | Styling, professional banking theme |
| Charts | Recharts | Heatmaps, line charts, bar charts, donut charts, gauges |
| State Management | React Context + TanStack Query | Server state caching, minimal client state |
| Routing | React Router v6 | Client-side navigation, breadcrumbs |
| Backend | Node.js 20+ with Express.js + TypeScript | REST API, business logic |
| ORM | Prisma | Type-safe database access, migrations, seeding |
| Database | PostgreSQL 15+ | Relational data, ACID compliance |
| Auth | JWT + RBAC | Role-based authentication and authorization |
| Build | Vite (frontend), tsx (backend) | Fast dev builds |

### Project Structure

```
craf-prototype/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/              # DashboardLayout, Sidebar, Header, Breadcrumbs
│   │   │   ├── dashboard/           # ExecutiveDashboard, KPICards, RiskHeatmap, TrendCharts
│   │   │   ├── risk-assessment/     # AUDetailView, LikelihoodBreakdown, ImpactBreakdown
│   │   │   ├── controls/            # ControlTable, CQADetail, CPADetail, CERSummary
│   │   │   ├── comparison/          # YearOverYearView, BeforeAfterView
│   │   │   ├── compliance/          # RBIComplianceDashboard, ReturnsTable, BreachList
│   │   │   ├── early-warning/       # EarlyWarningPanel, TrendIndicators
│   │   │   ├── scenarios/           # ScenarioSelector, WhatIfModeler
│   │   │   ├── materiality/         # MaterialityPage, WaterfallChart, MaterialityTable
│   │   │   ├── auth/                # LoginPage, ProtectedRoute, RoleGuard
│   │   │   └── shared/              # DataTable, Badge, TrafficLight, FilterBar
│   │   ├── pages/                   # Route-level page components
│   │   ├── hooks/                   # Custom React hooks (useRiskData, useDashboard, etc.)
│   │   ├── services/                # API client functions
│   │   ├── types/                   # TypeScript interfaces
│   │   └── lib/                     # Utilities, constants, color mappings
│   └── index.html
├── server/                          # Express backend
│   ├── src/
│   │   ├── routes/                  # Express route handlers
│   │   ├── services/                # Business logic services
│   │   │   ├── risk-calculator/     # Core CRAF calculation engine
│   │   │   ├── dashboard-service/   # Aggregation for dashboard views
│   │   │   └── seed-data/           # Sample data generator
│   │   ├── middleware/              # Auth, error handling, validation
│   │   │   ├── rbac.middleware.ts
│   │   │   ├── error-handler.middleware.ts
│   │   │   └── validation.middleware.ts
│   │   └── types/                   # Shared TypeScript types
│   └── prisma/
│       ├── schema.prisma            # Database schema
│       ├── migrations/              # Schema migrations
│       └── seed.ts                  # Seed data script
└── package.json
```

## Database Design

### Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────────┐     ┌───────────────────────┐
│    themes     │     │ assessment_units  │     │ compliance_obligations│
│──────────────│     │──────────────────│     │───────────────────────│
│ id (PK)      │◄────│ id (PK)          │◄────│ id (PK)               │
│ code         │  1:N│ code             │  1:N│ code                  │
│ name         │     │ name             │     │ regulation_source     │
│ description  │     │ theme_id (FK)    │     │ regulation_ref        │
└──────────────┘     │ business_area    │     │ regulation_name       │
                     │ owner_name       │     │ reference_paragraph   │
                     │ description      │     │ description           │
                     │ is_active        │     │ owner_within_au       │
                     └────────┬─────────┘     │ frequency             │
                              │               │ theme_id (FK)         │
                              │               │ au_id (FK)            │
                              │               │ criticality           │
                              │               └───────────┬───────────┘
                              │                           │
                     ┌────────▼─────────┐     ┌───────────▼───────────┐
                     │  inherent_risk    │     │      controls         │
                     │──────────────────│     │───────────────────────│
                     │ id (PK)          │     │ id (PK)               │
                     │ au_id (FK)       │     │ code                  │
                     │ period_id (FK)   │     │ name                  │
                     │ volume_growth... │     │ description           │
                     │ complexity...    │     │ obligation_id (FK)    │
                     │ likelihood_score │     │ control_type          │
                     │ impact_score     │     │ control_nature        │
                     │ ir_score         │     │ frequency             │
                     │ ir_rating        │     │ monitoring_mechanism  │
                     └──────────────────┘     │ is_documented         │
                                              │ owner_role            │
                     ┌──────────────────┐     └───────────┬───────────┘
                     │assessment_periods│               │  │
                     │──────────────────│     ┌─────────▼──▼──────────┐
                     │ id (PK)          │     │  control_quality      │
                     │ name             │     │───────────────────────│
                     │ start_date       │     │ id (PK)               │
                     │ end_date         │     │ control_id (FK)       │
                     │ is_current       │     │ period_id (FK)        │
                     └──────────────────┘     │ monitoring_score      │
                                              │ automation_score      │
                     ┌──────────────────┐     │ type_score            │
                     │ control_env_     │     │ documentation_score   │
                     │ rating           │     │ cqa_raw_score         │
                     │──────────────────│     │ cqa_scaled_score      │
                     │ id (PK)          │     └───────────────────────┘
                     │ au_id (FK)       │
                     │ period_id (FK)   │     ┌───────────────────────┐
                     │ cqi_score        │     │ control_performance   │
                     │ cqi_interp_score │     │───────────────────────│
                     │ cpi_score        │     │ id (PK)               │
                     │ cpi_interp_score │     │ control_id (FK)       │
                     │ cer_score        │     │ period_id (FK)        │
                     │ cer_rating       │     │ kci_linked            │
                     └──────────────────┘     │ kci_result            │
                                              │ self_assessment_result│
                     ┌──────────────────┐     │ control_testing_result│
                     │  residual_risk   │     │ cpa_raw_score         │
                     │──────────────────│     │ cpa_scaled_score      │
                     │ id (PK)          │     └───────────────────────┘
                     │ au_id (FK)       │
                     │ period_id (FK)   │     ┌───────────────────────┐
                     │ ir_score         │     │  rating_overrides     │
                     │ cer_score        │     │───────────────────────│
                     │ rr_score         │     │ id (PK)               │
                     │ rr_rating        │     │ au_id (FK)            │
                     │ aggregate_weight │     │ period_id (FK)        │
                     └──────────────────┘     │ original_rating       │
                                              │ overridden_rating     │
                     ┌──────────────────┐     │ reason                │
                     │     users        │     │ officer_name          │
                     │──────────────────│     │ timestamp             │
                     │ id (PK)          │     └───────────────────────┘
                     │ username         │
                     │ name             │     ┌───────────────────────┐
                     │ role             │     │  au_volume_definitions│
                     │ password_hash    │     │───────────────────────│
                     │ assigned_au_ids  │     │ id (PK)               │
                     └──────────────────┘     │ au_id (FK)            │
                                              │ volume_definition     │
                     ┌──────────────────┐     │ current_volume        │
                     │ role_permissions │     │ previous_volume       │
                     │──────────────────│     └───────────────────────┘
                     │ id (PK)          │
                     │ role             │
                     │ resource         │
                     │ action           │
                     │ scope            │
                     └──────────────────┘
```

### Prisma Schema

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Theme {
  id          Int              @id @default(autoincrement())
  code        String           @unique
  name        String
  description String?
  assessmentUnits AssessmentUnit[]
  obligations ComplianceObligation[]
  @@map("themes")
}

model AssessmentUnit {
  id            Int      @id @default(autoincrement())
  code          String   @unique
  name          String
  themeId       Int      @map("theme_id")
  businessArea  String   @map("business_area")  // Retail Banking, Corporate/Wholesale Banking, Treasury and Markets, Support Functions
  ownerName     String?  @map("owner_name")
  description   String?
  isActive      Boolean  @default(true) @map("is_active")
  createdAt     DateTime @default(now()) @map("created_at")

  theme              Theme                  @relation(fields: [themeId], references: [id])
  obligations        ComplianceObligation[]
  inherentRisks      InherentRisk[]
  controlEnvRatings  ControlEnvironmentRating[]
  residualRisks      ResidualRisk[]
  ratingOverrides    RatingOverride[]
  volumeDefinition   AUVolumeDefinition?
  auThemes           AUThemeMapping[]
  systemComplexities AUSystemComplexity[]
  productComplexity  AUProductComplexity?

  @@map("assessment_units")
}

model AUThemeMapping {
  id      Int @id @default(autoincrement())
  auId    Int @map("au_id")
  themeId Int @map("theme_id")

  au    AssessmentUnit @relation(fields: [auId], references: [id])
  @@map("au_theme_mappings")
}

model ComplianceObligation {
  id                  Int      @id @default(autoincrement())
  code                String   @unique
  regulationSource    String   @map("regulation_source")
  regulationRef       String?  @map("regulation_ref")
  regulationName      String?  @map("regulation_name")
  referenceParagraph  String?  @map("reference_paragraph")
  description         String
  ownerWithinAU       String?  @map("owner_within_au")
  frequency           String?  // Daily, Weekly, Monthly, Quarterly, Annual
  themeId             Int      @map("theme_id")
  auId                Int      @map("au_id")
  criticality         String?  // Critical, High, Medium, Low
  isActive            Boolean  @default(true) @map("is_active")

  theme    Theme          @relation(fields: [themeId], references: [id])
  au       AssessmentUnit @relation(fields: [auId], references: [id])
  controls Control[]

  @@map("compliance_obligations")
}

model Control {
  id                   Int      @id @default(autoincrement())
  code                 String   @unique
  name                 String
  description          String?
  obligationId         Int      @map("obligation_id")
  controlType          String   @map("control_type")     // Preventive, Detective
  controlNature        String   @map("control_nature")   // Manual, IT-driven, IT-based manual
  frequency            String?
  monitoringMechanism  String?  @map("monitoring_mechanism") // MRC+IT, NA+IT, MRC+Manual, etc.
  isDocumented         Boolean  @default(false) @map("is_documented")
  ownerRole            String?  @map("owner_role")
  isActive             Boolean  @default(true) @map("is_active")

  obligation           ComplianceObligation @relation(fields: [obligationId], references: [id])
  qualityAssessments   ControlQuality[]
  performanceAssessments ControlPerformance[]

  @@map("controls")
}

model AssessmentPeriod {
  id        Int      @id @default(autoincrement())
  name      String   // e.g., "FY 2024-25", "FY 2023-24"
  startDate DateTime @map("start_date")
  endDate   DateTime @map("end_date")
  isCurrent Boolean  @default(false) @map("is_current")

  inherentRisks     InherentRisk[]
  controlQualities  ControlQuality[]
  controlPerformances ControlPerformance[]
  controlEnvRatings ControlEnvironmentRating[]
  residualRisks     ResidualRisk[]
  ratingOverrides   RatingOverride[]

  @@map("assessment_periods")
}

model InherentRisk {
  id                    Int    @id @default(autoincrement())
  auId                  Int    @map("au_id")
  periodId              Int    @map("period_id")
  // Likelihood parameters (each scored 5/10/15/20/25)
  volumeGrowthScore     Int    @map("volume_growth_score")
  complexityScore       Int    @map("complexity_score")
  regulatoryReturnsScore Int   @map("regulatory_returns_score")
  complianceBreachesScore Int  @map("compliance_breaches_score")
  controlFailuresScore  Int    @map("control_failures_score")
  customerComplaintsScore Int  @map("customer_complaints_score")
  likelihoodRawAvg      Float  @map("likelihood_raw_avg")
  likelihoodScore       Int    @map("likelihood_score")   // Scaled
  likelihoodRating      String @map("likelihood_rating")  // Rare..Almost Certain
  // Impact parameters (each scored 5/10/15/20/25)
  businessImpactScore   Int    @map("business_impact_score")
  reputationalImpactScore Int  @map("reputational_impact_score")
  financialPenaltyScore Int    @map("financial_penalty_score")
  glImpactScore         Int    @map("gl_impact_score")
  impactScore           Int    @map("impact_score")       // Max of 4 params
  impactRating          String @map("impact_rating")
  // Inherent risk
  inherentRiskScore     Int    @map("inherent_risk_score") // likelihood * impact
  inherentRiskRating    String @map("inherent_risk_rating")
  assessmentDate        DateTime? @map("assessment_date")

  au     AssessmentUnit   @relation(fields: [auId], references: [id])
  period AssessmentPeriod @relation(fields: [periodId], references: [id])

  @@unique([auId, periodId])
  @@map("inherent_risk")
}

model ControlQuality {
  id                Int    @id @default(autoincrement())
  controlId         Int    @map("control_id")
  periodId          Int    @map("period_id")
  monitoringScore   Int    @map("monitoring_score")     // 1, 3, or 5
  automationScore   Int    @map("automation_score")     // 1, 3, or 5
  typeScore         Int    @map("type_score")           // 1, 3, or 5
  documentationScore Int   @map("documentation_score")  // 1 or 5
  cqaRawScore       Int    @map("cqa_raw_score")        // product of 4
  cqaScaledScore    Int    @map("cqa_scaled_score")     // 5/10/15/20/25
  controlCategory   String @map("control_category")

  control Control          @relation(fields: [controlId], references: [id])
  period  AssessmentPeriod  @relation(fields: [periodId], references: [id])

  @@unique([controlId, periodId])
  @@map("control_quality")
}

model ControlPerformance {
  id                    Int     @id @default(autoincrement())
  controlId             Int     @map("control_id")
  periodId              Int     @map("period_id")
  controlRiskType       String  @map("control_risk_type") // Compliance, ICOFR, Converged
  kciLinked             Boolean @map("kci_linked")
  kciResult             String? @map("kci_result")          // Pass, Fail, NA
  selfAssessmentResult  String  @map("self_assessment_result") // Pass, Pass with Exception, Fail
  kciSelfAssessmentScore Int    @map("kci_self_assessment_score") // 1, 3, or 5
  controlTestingResult  String  @map("control_testing_result")  // Pass, Pass with Exception, Fail, Not Tested
  controlTestingScore   Int     @map("control_testing_score")   // 1, 3, or 5
  cpaRawScore           Int     @map("cpa_raw_score")           // kci_sa * testing
  cpaScaledScore        Int     @map("cpa_scaled_score")        // 5/10/15/20/25
  performanceCategory   String  @map("performance_category")

  control Control          @relation(fields: [controlId], references: [id])
  period  AssessmentPeriod  @relation(fields: [periodId], references: [id])

  @@unique([controlId, periodId])
  @@map("control_performance")
}

model ControlEnvironmentRating {
  id              Int     @id @default(autoincrement())
  auId            Int     @map("au_id")
  periodId        Int     @map("period_id")
  cqiWeightedAvg  Float   @map("cqi_weighted_avg")
  cqiScore        Float   @map("cqi_score")        // 100% - weighted avg CQA
  cqiInterpScore  Int     @map("cqi_interp_score")  // 1, 4, 9, 16, or 25
  cpiWeightedAvg  Float   @map("cpi_weighted_avg")
  cpiScore        Float   @map("cpi_score")        // 100% - weighted avg CPA
  cpiInterpScore  Int     @map("cpi_interp_score")  // 1, 4, 9, 16, or 25
  cerScore        Float   @map("cer_score")        // CQI interp * CPI interp
  cerRating       String  @map("cer_rating")

  au     AssessmentUnit   @relation(fields: [auId], references: [id])
  period AssessmentPeriod @relation(fields: [periodId], references: [id])

  @@unique([auId, periodId])
  @@map("control_environment_rating")
}

model ResidualRisk {
  id                  Int     @id @default(autoincrement())
  auId                Int     @map("au_id")
  periodId            Int     @map("period_id")
  inherentRiskScore   Int     @map("inherent_risk_score")
  cerScore            Float   @map("cer_score")
  residualRiskScore   Float   @map("residual_risk_score")  // IR / CER
  residualRiskRating  String  @map("residual_risk_rating")
  aggregateResidual   Float?  @map("aggregate_residual")   // Weighted aggregation %
  aggregateRating     String? @map("aggregate_rating")      // Extremely High..Negligible
  assessmentDate      DateTime? @map("assessment_date")

  au     AssessmentUnit   @relation(fields: [auId], references: [id])
  period AssessmentPeriod @relation(fields: [periodId], references: [id])

  @@unique([auId, periodId])
  @@map("residual_risk")
}

model RatingOverride {
  id              Int      @id @default(autoincrement())
  auId            Int      @map("au_id")
  periodId        Int      @map("period_id")
  originalRating  String   @map("original_rating")
  overriddenRating String  @map("overridden_rating")
  reason          String
  officerName     String   @map("officer_name")
  officerRole     String   @map("officer_role")
  createdAt       DateTime @default(now()) @map("created_at")

  au     AssessmentUnit   @relation(fields: [auId], references: [id])
  period AssessmentPeriod @relation(fields: [periodId], references: [id])

  @@map("rating_overrides")
}

model AUVolumeDefinition {
  id               Int    @id @default(autoincrement())
  auId             Int    @unique @map("au_id")
  volumeDefinition String @map("volume_definition")
  currentVolume    Float? @map("current_volume")
  previousVolume   Float? @map("previous_volume")
  growthPercent    Float? @map("growth_percent")

  au AssessmentUnit @relation(fields: [auId], references: [id])

  @@map("au_volume_definitions")
}

model AUSystemComplexity {
  id              Int    @id @default(autoincrement())
  auId            Int    @map("au_id")
  systemName      String @map("system_name")
  interfaceCount  Int    @map("interface_count")
  tierCategory    String @map("tier_category")  // Tier 0, 1, 2, 3
  changeRequests  Int    @map("change_requests")
  interfaceScore  Int    @map("interface_score")
  tierScore       Int    @map("tier_score")
  changeScore     Int    @map("change_score")
  weightedAvg     Float  @map("weighted_avg")
  finalScore      Int    @map("final_score")    // Rounded to next multiple of 5

  au AssessmentUnit @relation(fields: [auId], references: [id])

  @@map("au_system_complexity")
}

model AUProductComplexity {
  id                    Int    @id @default(autoincrement())
  auId                  Int    @unique @map("au_id")
  auType                String @map("au_type")  // Business Group, Operations/Support Group
  easeOfUnderstanding   Int    @map("ease_of_understanding")   // 1, 3, or 9
  productVariants       Int?   @map("product_variants")        // 1, 3, or 9 (null for Ops/Support)
  regulatoryGuidelines  Int    @map("regulatory_guidelines")   // 1, 3, or 9
  complexityOfGuidelines Int   @map("complexity_of_guidelines") // 1, 3, or 9
  supervisoryFocus      Int    @map("supervisory_focus")       // 1, 3, or 9
  rawScore              Int    @map("raw_score")               // Product of params
  category              String // Low, Medium, High

  au AssessmentUnit @relation(fields: [auId], references: [id])

  @@map("au_product_complexity")
}

model User {
  id           Int    @id @default(autoincrement())
  username     String @unique
  name         String
  role         String // GCCO, GCO, HeadCompliance, HeadCPR, CGAdvisory, AUHead, ComplianceMonitoring
  passwordHash String @map("password_hash")
  assignedAuIds Int[] @map("assigned_au_ids") // For AUHead role scoping

  @@map("users")
}

model RolePermission {
  id         Int    @id @default(autoincrement())
  role       String // GCCO, GCO, HeadCompliance, HeadCPR, CGAdvisory, AUHead, ComplianceMonitoring
  resource   String // assessment-units, controls, overrides, dashboard, etc.
  action     String // read, write, delete
  scope      String // all, own, assigned (own = created by user, assigned = AU-level restriction)

  @@unique([role, resource, action])
  @@map("role_permissions")
}

model MaterialityAssessment {
  id                    Int     @id @default(autoincrement())
  periodId              Int     @map("period_id")
  profitBeforeTax       Float   @map("profit_before_tax")
  totalAssets           Float   @map("total_assets")
  revenueMateriality    Float   @map("revenue_materiality")    // 5% of PBT
  balanceSheetMateriality Float @map("balance_sheet_materiality") // 0.5% of total assets
  haircutPercent        Float   @default(25) @map("haircut_percent")
  finalRevenueMateriality Float @map("final_revenue_materiality")
  finalBSMateriality    Float   @map("final_bs_materiality")
  tolerableError        Float?  @map("tolerable_error")

  @@map("materiality_assessments")
}
```

## Risk Calculation Engine Design

The Risk Calculator is the core backend module implementing all CRAF formulas. Each calculation is a pure function that takes input parameters and returns computed scores and ratings.

### Likelihood Calculator

```typescript
// Input: raw parameter values for an AU
// Output: scaled likelihood score (5/10/15/20/25) and rating

interface LikelihoodInput {
  volumeGrowthPercent: number;       // % increase in business volume
  systemComplexityScore: number;     // from system complexity calc
  productComplexityCategory: string; // Low/Medium/High
  regulatoryReturnsCount: number;    // count of returns
  complianceBreachCount: number;     // breaches in last 12 months
  icofrFailureCount: number;         // ICOFR failures in last 12 months
  customerComplaintCount: number;    // complaints count
}

// Step 1: Score each parameter to 5/10/15/20/25
// Step 2: Compute average of 6 scores
// Step 3: Apply scaling table to average:
//   >5 & <7.5 → 5,  >=7.5 & <=10 → 10,  >10 & <12.5 → 10,
//   >=12.5 & <=15 → 15,  >15 & <17.5 → 15,  >=17.5 & <=20 → 20,
//   >20 & <22.5 → 20,  >=22.5 & <=25 → 25
// Step 4: Map scaled score to rating:
//   25→Almost Certain, 20→Likely, 15→Possible, 10→Unlikely, 5→Rare
```

### Impact Calculator

```typescript
// Input: 4 impact parameters at cluster level
// Output: impact score (max of 4 params) and rating

interface ImpactInput {
  businessImpact: number;       // 5/10/15/20/25
  mediaImpact: number;          // 5/10/15/20
  financialPenalty: number;     // 5 or 25
  glImpact: number;             // 15/20/25
}

// Overall impact = MAX(businessImpact, mediaImpact, financialPenalty, glImpact)
```

### Inherent Risk Calculator

```typescript
// inherentRiskScore = likelihoodScore × impactScore
// Rating thresholds:
//   >=375 → Extremely High
//   >=200 → Very High
//   >=100 → High
//   >=25  → Minor
//   <25   → Insignificant
```

### System Complexity Calculator

```typescript
// For each system mapped to an AU:
//   1. Score 3 params: interfaces, tier, change requests
//   2. Weighted average of 3 scores → round to next multiple of 5
// For multiple systems on one AU:
//   Simple average of all system final scores → apply scaling
```

### Product Complexity Calculator

```typescript
// Multiply 5 params (or 4 for Ops/Support, excluding product variants)
// Each param scored 1, 3, or 9
// Business Groups thresholds: <=243 Low, 244-2187 Medium, >2188 High
// Ops/Support thresholds: <=81 Low, 82-729 Medium, >729 High
```

### CQA Calculator

```typescript
// For each control:
//   cqaRaw = monitoring × automation × type × documentation
//   Scale: <9→5, >=9&<81→10, >=81&<225→15, >=225&<500→20, >=500→25
//   Category: 5→Significant Improvement Needed, 10→Improvement Needed,
//             15→Meets Requirement, 20→Effective, 25→Significantly Effective
```

### CQI Calculator

```typescript
// 1. Categorize controls by CQA raw score:
//      No Control (no control exists): weight 100%
//      Significant Improvement Needed (<15): weight 80%
//      Improvement Needed (>=15 & <30): weight 60%
//      Meets Requirements (>=30 & <60): weight 40%
//      Effective Control (>=60 & <125): weight 30%
//      Significantly Effective (=125): weight 20%
// 2. weightedAvgCQA = sum(count_per_category × weight) / total_controls
// 3. CQI = 100% - weightedAvgCQA
// 4. Interpret CQI:
//      <40% → Significant Improvement Needed (score 1)
//      >=40% → Improvement Needed (score 4)
//      >=60% → Partially Effective (score 9)
//      >=70% → Meets Requirements (score 16)
//      >=80% → Effective (score 25)
```

### CPA Calculator

```typescript
// Step 1: KCI & Self-Assessment score (1, 3, or 5) per scenario matrices
//   - Compliance controls: 5 scenarios
//   - ICOFR/Converged controls: 6 scenarios
// Step 2: Control Testing score: Pass→5, Pass w/ Exception→3, Fail→1, Not Tested→5
// Step 3: cpaRaw = kciSelfAssessmentScore × controlTestingScore
// Step 4: Scale: 1→5, 3→5, 5→5, 9→10, 15→15, 25→25
```

### CPI Calculator

```typescript
// Same weighted average approach as CQI but using CPA raw scores:
//   No Control: 100%
//   Significant Improvement Needed (>=5 & <45): 80%
//   Improvement Needed (>=45 & <225): 60%
//   Meets Requirements (>=225 & <250): 40%
//   Effective Control (>=250 & <375): 30%
//   Significantly Effective (>=250 & <375): 20%
// CPI = 100% - weightedAvgCPA
// Interpret same as CQI thresholds
```

### CER Calculator

```typescript
// CER = CQI_interp_score × CPI_interp_score
// Rating: <15→Significant Improvement Needed, >=15&<30→Improvement Needed,
//         >=30&<60→Partially Effective, >=60&<125→Meets Requirement, >=125→Effective
```

### Residual Risk Calculator

```typescript
// Per control: residualRisk = inherentRiskScore / cerScore
// Rating: No control→No Control, >=6.67→Significant Improvement Needed,
//         <6.67&>2→Improvement Needed, <=2&>1→Meets Requirement, <=1→Well Controlled

// Aggregation at AU level:
//   Weights: No Control 100%, Sig Improvement 80%, Improvement 60%,
//            Meets Requirement 25%, Well Controlled 1%
//   aggregateResidual = sum(count × weight) / totalControls
//   Rating: >=70%→Extremely High, >=45%→High, >5%→Medium, >1%→Low, <=1%→Negligible
```

## API Design

All endpoints return JSON. Base path: `/api`. Authentication via JWT token in `Authorization: Bearer <token>` header (simplified for demo).

### Authentication

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|-------------|----------|
| POST | `/api/auth/login` | Login | `{ username, password }` | `{ token, userId, name, role }` |

### Dashboard Endpoints

| Method | Path | Description | Query Params |
|--------|------|-------------|-------------|
| GET | `/api/dashboard/executive` | Executive dashboard data | `periodId`, `viewMode` (realtime\|periodic) |
| GET | `/api/dashboard/executive/kpis` | KPI cards only | `periodId` |
| GET | `/api/dashboard/executive/heatmap` | Risk heatmap data | `periodId`, `businessArea?`, `riskRating?`, `themeId?` |
| GET | `/api/dashboard/executive/trends` | Risk trend charts | `periodId` |
| GET | `/api/dashboard/rbi-compliance` | RBI compliance dashboard | `periodId` |

#### Executive Dashboard Response Shape

```typescript
interface ExecutiveDashboardResponse {
  kpis: {
    overallResidualRiskScore: number;
    highCriticalRisksCount: number;
    controlEffectivenessPercent: number;
    complianceBreachTrend: number[];  // last 12 months
  };
  heatmap: Array<{
    auId: number;
    auName: string;
    businessArea: string;
    themeName: string;
    residualRiskScore: number;
    residualRiskRating: string;  // Extremely High..Negligible
    color: string;               // red/orange/yellow/lightgreen/green
    hasEarlyWarning: boolean;
  }>;
  trends: {
    labels: string[];            // quarterly labels
    residualRisk: number[];
    controlEffectiveness: number[];
  };
  riskDistributionByTheme: Record<string, {
    extremelyHigh: number;
    veryHigh: number;
    high: number;
    minor: number;
    insignificant: number;
  }>;
  controlsByEffectiveness: {
    effective: number;
    meetsRequirement: number;
    improvementNeeded: number;
    significantImprovement: number;
  };
}
```

### Assessment Unit Endpoints

| Method | Path | Description | Query Params |
|--------|------|-------------|-------------|
| GET | `/api/assessment-units` | List all AUs | `businessArea?`, `themeId?`, `isActive?` |
| GET | `/api/assessment-units/:auId` | AU basic info | — |
| GET | `/api/assessment-units/:auId/detail` | Full AU detail with risk data | `periodId` |
| GET | `/api/assessment-units/:auId/volume-definition` | Volume definition | — |

#### AU Detail Response Shape

```typescript
interface AUDetailResponse {
  auInfo: {
    id: number; code: string; name: string;
    businessArea: string; themeName: string; ownerName: string;
  };
  inherentRisk: {
    likelihoodScore: number;
    likelihoodRating: string;
    likelihoodParameters: {
      volumeGrowth: { value: number; score: number };
      complexity: { value: number; score: number };
      regulatoryReturns: { value: number; score: number };
      complianceBreaches: { value: number; score: number };
      controlFailures: { value: number; score: number };
      customerComplaints: { value: number; score: number };
    };
    impactScore: number;
    impactRating: string;
    impactParameters: {
      businessImpact: { value: string; score: number };
      reputationalImpact: { value: string; score: number };
      financialPenalty: { value: string; score: number };
      glImpact: { value: string; score: number };
    };
    inherentRiskScore: number;
    inherentRiskRating: string;
  };
  controlEnvironment: {
    cqiScore: number;
    cqiInterpScore: number;
    cqiRating: string;
    cqiDistribution: Record<string, number>;  // category → count
    cpiScore: number;
    cpiInterpScore: number;
    cpiRating: string;
    cpiDistribution: Record<string, number>;
    cerScore: number;
    cerRating: string;
  };
  residualRisk: {
    residualRiskScore: number;
    residualRiskRating: string;
    aggregateResidual: number;
    aggregateRating: string;
    previousPeriodScore: number | null;
    changePct: number | null;
  };
  obligations: Array<{
    id: number; code: string; description: string;
    frequency: string; criticality: string;
    controlCount: number;
    controls: Array<{
      id: number; name: string; controlType: string;
      cqaScaledScore: number; cpaScaledScore: number;
      residualRiskRating: string;
    }>;
  }>;
  earlyWarnings: Array<{
    type: string;  // deteriorating_risk | approaching_failure | breach_trend
    message: string;
    severity: string;
  }>;
}
```

### Risk Assessment Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inherent-risk` | Get inherent risk for AU+period |
| POST | `/api/inherent-risk/calculate` | Calculate/recalculate inherent risk |
| GET | `/api/residual-risk` | Get residual risk for AU+period |
| GET | `/api/residual-risk/aggregate` | Get aggregated residual risk at AU/theme/enterprise level |

### Control Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/controls` | List controls (filter by auId, obligationId) |
| GET | `/api/controls/:controlId` | Control detail |
| GET | `/api/controls/:controlId/quality` | CQA detail for a control |
| GET | `/api/controls/:controlId/performance` | CPA detail for a control |
| GET | `/api/control-environment/:auId` | CER with CQI/CPI breakdown |

### Comparison Endpoints

| Method | Path | Description | Query Params |
|--------|------|-------------|-------------|
| GET | `/api/comparison/year-over-year` | YoY comparison | `auId?`, `themeId?`, `currentPeriodId`, `previousPeriodId` |
| GET | `/api/comparison/before-after` | Before/after control change | `auId`, `controlId` |

### Rating Override Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/rating-overrides` | Create a rating override |
| GET | `/api/rating-overrides` | List overrides (filter by auId, periodId) |

### Early Warning Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/early-warnings` | All active early warnings |
| GET | `/api/early-warnings/:auId` | Early warnings for specific AU |

### Materiality Endpoints

| Method | Path | Description | Query Params |
|--------|------|-------------|-------------|
| GET | `/api/materiality` | Get materiality assessment for a period | `periodId` |
| POST | `/api/materiality` | Create/update materiality assessment | — |
| GET | `/api/materiality/significant-accounts` | Get significant accounts list | `periodId` |

### Themes Endpoint

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/themes` | List all 21 regulatory themes |
| GET | `/api/themes/:themeId/assessment-units` | AUs under a theme |

## RBAC Design

### Role-Permission Matrix

| Role | Dashboard | All AUs | Own AUs | Controls | Overrides | Compliance | Materiality |
|------|-----------|---------|---------|----------|-----------|------------|-------------|
| GCCO | Read | Read | Read/Write | Read/Write | Read/Write | Read | Read/Write |
| GCO | Read | Read | Read | Read/Write | Read | Read | Read |
| HeadCompliance | Read | Read | Read | Read | Read/Write | Read | Read/Write |
| HeadCPR | Read | Read | Read | Read | — | Read | Read |
| CGAdvisory | Read | Read | Read | Read/Write | — | Read | — |
| AUHead | Read | — | Read/Write | Read/Write | — | — | — |
| ComplianceMonitoring | Read | Read | Read | Read | — | Read | — |

### RBAC Middleware Design

```typescript
// server/src/middleware/rbac.middleware.ts

interface Permission {
  resource: string;
  action: 'read' | 'write' | 'delete';
  scope: 'all' | 'own' | 'assigned';
}

// Middleware factory: authorize(resource, action)
// 1. Extract user role from JWT token
// 2. Look up permissions for role + resource + action
// 3. If scope = 'all', allow
// 4. If scope = 'assigned', check if requested auId is in user.assignedAuIds
// 5. If scope = 'own', check if entity was created by user
// 6. If no permission found, return 403 Forbidden
```

### Frontend Route Guards

```typescript
// client/src/components/auth/RoleGuard.tsx
// Wraps routes/components, checks user role against required permissions
// Hides sidebar items not accessible to current role
// Disables action buttons (override, edit) when user lacks write permission
```

## Error Handling Strategy

### API Error Response Format

```typescript
interface ApiErrorResponse {
  status: number;        // HTTP status code
  code: string;          // Machine-readable error code (e.g., "VALIDATION_ERROR", "CER_ZERO_DIVISION")
  message: string;       // Human-readable message
  details?: unknown;     // Optional additional context
  timestamp: string;     // ISO 8601
}
```

### Error Categories

| Category | HTTP Status | Code Pattern | Example |
|----------|-------------|-------------|---------|
| Validation | 400 | VALIDATION_* | Invalid score parameter value |
| Authentication | 401 | AUTH_* | Missing or expired JWT token |
| Authorization | 403 | RBAC_* | Insufficient permissions for resource |
| Not Found | 404 | NOT_FOUND_* | AU or control not found |
| Calculation Edge Case | 422 | CALC_* | CER is zero, cannot compute residual risk |
| Server Error | 500 | INTERNAL_* | Unexpected server error |

### Calculation Edge Cases

```typescript
// CER = 0 edge case in residual risk calculation
// When CER score is 0 or undefined:
//   - Do NOT divide (would produce Infinity)
//   - Assign residualRiskRating = "No Control"
//   - Log warning: "CER is zero for AU {auId}, period {periodId}"

// Score clamping for out-of-bounds values
// If any calculated score falls outside [5, 25] range:
//   - Clamp to nearest valid band: min(25, max(5, score))
//   - Log warning with original value and clamped value
```

### Frontend Error Boundaries

```typescript
// React error boundary wrapping each major section
// Catches render errors, displays: "Something went wrong. Please refresh."
// Does NOT expose stack traces or internal error details
// Logs error to console in development mode only
```

## Materiality Assessment Design

### Materiality Page Component

```
/materiality → Materiality Assessment Page

Layout:
┌─────────────────────────────────────────────────────┐
│  Financial Inputs Card                               │
│  PBT: ₹X,XXX Cr  |  Total Assets: ₹X,XX,XXX Cr    │
├─────────────────────────────────────────────────────┤
│  Waterfall Visualization                             │
│  PBT → 5% → Revenue Materiality → 25% Haircut →    │
│  Final Revenue Materiality                           │
│  Total Assets → 0.5% → BS Materiality → 25% Haircut│
│  → Final BS Materiality                              │
├─────────────────────────────────────────────────────┤
│  Significant Accounts Table                          │
│  Account | Level | Amount | Significant? | Mapped To │
├─────────────────────────────────────────────────────┤
│  Tolerable Error Configuration                       │
│  Current threshold: ₹XX Cr                           │
└─────────────────────────────────────────────────────┘
```

### Materiality Service

```typescript
// server/src/services/materiality.service.ts
// calculateMateriality(periodId, pbt, totalAssets, haircutPercent)
//   revenueMateriality = pbt * 0.05
//   bsMateriality = totalAssets * 0.005
//   finalRevenue = revenueMateriality * (1 - haircutPercent/100)
//   finalBS = bsMateriality * (1 - haircutPercent/100)
```

## Frontend Component Design

### Page Routing

```
/                          → Redirect to /dashboard
/login                     → Login page
/dashboard                 → Executive Dashboard (Level 1: Enterprise)
/dashboard/theme/:themeId  → Theme-level view (Level 2: Theme)
/dashboard/au/:auId        → AU Detail view (Level 3: AU)
/dashboard/au/:auId/obligation/:obligationId → Obligation detail (Level 4: Obligation)
/comparison/yoy            → Year-over-year comparison
/comparison/before-after/:auId → Before/after comparison
/compliance/rbi            → RBI Compliance Status Dashboard
/scenarios/:scenarioId     → Demo scenario views (1, 2, 3)
/materiality               → Materiality Assessment Page
```

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Header: CRAF Logo | Period Selector | View Toggle | User   │
├────────┬────────────────────────────────────────────────────┤
│        │  Breadcrumbs: Enterprise > Theme > AU > Obligation │
│  Side  ├────────────────────────────────────────────────────┤
│  bar   │                                                    │
│        │              Main Content Area                     │
│  Nav:  │                                                    │
│  Dash  │  (KPIs, Heatmap, Charts, Tables, Detail Views)    │
│  Risk  │                                                    │
│  Ctrl  │                                                    │
│  Comp  │                                                    │
│  Scen  │                                                    │
│        │                                                    │
├────────┴────────────────────────────────────────────────────┤
│  Footer: Last Updated | Data As Of                          │
└─────────────────────────────────────────────────────────────┘
```

### Key Component Specifications

#### RiskHeatmap
- Grid layout of all AUs, grouped by business area
- Each cell color-coded: Red (#EF4444) Extremely High, Orange (#F97316) Very High, Yellow (#EAB308) High, Light Green (#84CC16) Minor, Green (#22C55E) Insignificant
- Hover tooltip: AU name, residual risk score, rating
- Click navigates to AU detail
- Early warning icon overlay on flagged AUs
- Filter bar: business area, risk rating, theme

#### KPICards (4 cards across top)
- Overall Residual Risk Score: large number, color-coded background
- High/Critical Risks Count: number with red badge if > 0
- Control Effectiveness %: circular gauge
- Compliance Breach Trend: sparkline (12 months)

#### TrendChart
- Recharts LineChart with quarterly data points over 2 years
- Lines for residual risk and control effectiveness
- Tooltip with exact values

#### AUDetailView
- Three collapsible sections: Inherent Risk, Control Environment, Residual Risk
- Inherent Risk: radar/bar chart of 6 likelihood params + 4 impact params, score and rating badges
- Control Environment: CQI donut (category distribution), CPI donut, CER calculation display
- Residual Risk: score with previous period comparison, delta indicator (green/red arrow)
- Obligations table: sortable by criticality, filterable, expandable rows showing controls

#### ComparisonView (YoY)
- Side-by-side cards: current vs previous period
- Delta percentages with color coding (red for deterioration, green for improvement)
- Available at enterprise, theme, and AU levels

#### BeforeAfterView
- Split screen: left = before state, right = after state
- Animated transition showing metric changes
- Used in Scenario 1 (Audit Finding Remediation)

#### EarlyWarningPanel
- List of flagged AUs with traffic light indicators
- Deteriorating risk trend: amber triangle icon
- Approaching failure: red circle icon
- Breach trend: red trending-up icon
- Click navigates to relevant AU

#### RBIComplianceDashboard
- Overall compliance score gauge
- Regulatory returns status table (DSB, ALM, IRAC, etc.)
- Recent breaches list (last 90 days)
- Upcoming deadlines calendar/list
- 12-month compliance trend line chart

## Seed Data Design

The Seed Data Generator creates mathematically consistent sample data for the demo. All computed scores follow the CRAF formulas exactly.

### Data Volume

| Entity | Count | Notes |
|--------|-------|-------|
| Assessment Periods | 2 | FY 2023-24 (previous), FY 2024-25 (current) |
| Themes | 21 | Per Annexure II |
| Assessment Units | 89 | Per Annexure I, across 4 business areas |
| Compliance Obligations | 100+ | Mapped across AUs, emphasis on RBI regulations |
| Controls | 300+ | Mapped to obligations, varied types |
| Users | 8 | One per governance role |
| Materiality Assessments | 2 | One per assessment period |

### Business Area Distribution

| Business Area | AU Count | Example AUs |
|---------------|----------|-------------|
| Retail Banking | ~25 | Retail Assets Operations, Branch Banking, Cards Product, Digital Channels |
| Corporate/Wholesale Banking | ~20 | Large Clients Group, Mid Corporate, Trade Finance Operations |
| Treasury and Markets | ~15 | Markets Group, Proprietary Trading, Treasury Control |
| Support Functions | ~29 | Business Technology, Compliance Group, Internal Audit, HRMG |

### Risk Distribution Strategy

The seed data intentionally creates a realistic distribution:
- ~10% of AUs: Extremely High / Very High residual risk (demo focal points)
- ~20% of AUs: High residual risk
- ~40% of AUs: Medium residual risk (Minor inherent risk category)
- ~30% of AUs: Low / Negligible residual risk

### Demo Scenario Pre-Population

Seed data includes sample materiality assessment data for both FY 2023-24 and FY 2024-25 periods, with realistic PBT and total asset figures for a large Indian bank.

#### Scenario 1: Audit Finding Remediation (Trade Finance Operations Group)
- Inherent risk score: 300 (Likelihood 15 × Impact 20), rating: Very High
- CQI: 40% (low due to LC issuance control deficiency)
- Deficient control: LC Issuance Maker-Checker with CQA raw score = 1 (manual, no maker-checker, no documentation)
- "After" state data: same control upgraded to CQA raw score = 625 (IT-driven, automated maker-checker, preventive, documented)
- After recalculation: CQI improves to 75%, residual risk drops from 300 to 120, rating changes Very High → Minor
- Heatmap color changes Red → Yellow

#### Scenario 2: Control Failure Investigation (Retail Liabilities — mapped to Liabilities Operations Group)
- Early warning triggered: 3 KCI failures in past month for Daily Cash Reconciliation control
- CPA score degraded from 25 to 5 (Significant Improvement Needed)
- CPI decreased from 80% to 55%
- Residual risk increased from 50 to 95, rating Medium → High
- Historical data shows 3-month degradation pattern

#### Scenario 3: New Regulation Impact Assessment (Digital Lending)
- New RBI Master Direction on Digital Lending affecting 3 AUs:
  - Digital Channels and Partnership: 5 new obligations
  - Cards Product: 3 new obligations
  - Retail Assets Operations Group: 7 new obligations
- What-if scenario data:
  - Scenario A (no controls): residual risk → Very High
  - Scenario B (basic controls): residual risk stays High
  - Scenario C (comprehensive controls): residual risk → Medium
- Total new obligations: 15

### Sample Users

| Username | Name | Role |
|----------|------|------|
| gcco | Group Chief Compliance Officer | GCCO |
| gco | Group Compliance Officer | GCO |
| head_compliance | Head of Compliance and ICOFR | HeadCompliance |
| head_cpr | Head of Compliance Process Re-Engineering | HeadCPR |
| cg_advisory | CG Advisory Team Lead | CGAdvisory |
| au_head_tf | Head of Trade Finance | AUHead |
| au_head_rl | Head of Retail Liabilities | AUHead |
| comp_monitor | Compliance Monitoring Lead | ComplianceMonitoring |

## Backend Service Architecture

### Service Layer

```
server/src/services/
├── risk-calculator/
│   ├── likelihood.service.ts      # Likelihood scoring (6 params + scaling)
│   ├── impact.service.ts          # Impact scoring (4 params, max)
│   ├── inherent-risk.service.ts   # IR = Likelihood × Impact + rating
│   ├── system-complexity.service.ts  # System complexity (3 params, weighted avg)
│   ├── product-complexity.service.ts # Product complexity (5 params, multiply)
│   ├── cqa.service.ts             # CQA raw + scaled per control
│   ├── cqi.service.ts             # CQI weighted average + interpretation
│   ├── cpa.service.ts             # CPA raw + scaled per control
│   ├── cpi.service.ts             # CPI weighted average + interpretation
│   ├── cer.service.ts             # CER = CQI × CPI + rating
│   ├── residual-risk.service.ts   # RR = IR / CER + aggregation
│   └── index.ts                   # Orchestrator: full recalculation pipeline
├── dashboard-service/
│   ├── executive.service.ts       # KPIs, heatmap, trends aggregation
│   ├── au-detail.service.ts       # Full AU detail assembly
│   ├── comparison.service.ts      # YoY and before/after data
│   ├── compliance.service.ts      # RBI compliance dashboard data
│   └── early-warning.service.ts   # Early warning detection logic
├── seed-data/
│   ├── themes.seed.ts             # 21 themes from Annexure II
│   ├── assessment-units.seed.ts   # 89 AUs from Annexure I
│   ├── obligations.seed.ts        # 100+ compliance obligations
│   ├── controls.seed.ts           # 300+ controls
│   ├── risk-data.seed.ts          # Inherent risk, CQA, CPA data for 2 periods
│   ├── scenario-data.seed.ts      # Pre-populated demo scenario data
│   ├── users.seed.ts              # 8 sample users
│   └── index.ts                   # Orchestrator: runs all seeds in order
├── materiality.service.ts         # Materiality calculation and significant accounts
└── auth.service.ts                # JWT token generation/validation
```

### Route Layer

```
server/src/routes/
├── auth.routes.ts                 # POST /api/auth/login
├── dashboard.routes.ts            # GET /api/dashboard/*
├── assessment-units.routes.ts     # GET /api/assessment-units/*
├── inherent-risk.routes.ts        # GET/POST /api/inherent-risk/*
├── controls.routes.ts             # GET /api/controls/*
├── control-environment.routes.ts  # GET /api/control-environment/*
├── residual-risk.routes.ts        # GET /api/residual-risk/*
├── comparison.routes.ts           # GET /api/comparison/*
├── rating-overrides.routes.ts     # GET/POST /api/rating-overrides
├── early-warnings.routes.ts       # GET /api/early-warnings/*
├── themes.routes.ts               # GET /api/themes/*
├── materiality.routes.ts          # GET/POST /api/materiality/*
└── compliance.routes.ts           # GET /api/compliance/*
```

### Early Warning Detection Logic

The early warning service runs on dashboard load and checks:

1. **Deteriorating Risk Trend**: Compare current period aggregate residual risk to previous period. Flag if increase > 10%.
2. **Approaching Failure Threshold**: Query controls where CPA scaled score has decreased across consecutive periods. Flag controls trending toward "Significant Improvement Needed".
3. **Breach Trend Warning**: Query AUs where compliance breach count is increasing over consecutive periods.

Each warning produces a traffic light indicator: Red (critical), Yellow (warning), Green (normal).

## Drill-Down Navigation Design

The 4-level drill-down is implemented via React Router nested routes with a persistent breadcrumb component.

```
Level 1: Enterprise    → /dashboard
         Shows all 89 AUs in heatmap, KPIs, trends
         Click AU → Level 3, Click theme group → Level 2

Level 2: Theme         → /dashboard/theme/:themeId
         Filters heatmap to AUs under selected theme
         Shows theme-level aggregated metrics
         Click AU → Level 3

Level 3: AU Detail     → /dashboard/au/:auId
         Full risk assessment breakdown
         Inherent risk, control environment, residual risk
         Obligations table with controls
         Click obligation → Level 4

Level 4: Obligation    → /dashboard/au/:auId/obligation/:obligationId
         Specific obligation details
         Associated controls with CQA and CPA scores
         Individual control residual risk ratings
```

Breadcrumb component reads route params and renders:
`Enterprise > [Theme Name] > [AU Name] > [Obligation Code]`

Each segment is clickable to navigate back to that level.


## MVP2 Design Considerations

Architectural notes for MVP2 (Production Hardening) features. These are not fully designed yet but outline the technical approach.

### Audit Trail

- New `audit_log` table: id, userId, action, entityType, entityId, beforeValue (JSON), afterValue (JSON), timestamp
- Middleware that intercepts all POST/PUT/DELETE requests and logs changes
- Audit log page with filters: user, action type, entity, date range

### Export Service

- PDF generation using a library like `@react-pdf/renderer` or `puppeteer` for server-side rendering
- CSV export using `json2csv` or similar
- Board report template with sections: Executive Summary, Risk Heatmap, Top Risks, Control Effectiveness, Compliance Status

### Notification Service

- New `notifications` table: id, userId, type, title, message, link, isRead, createdAt
- Server-side notification creation on: early warning trigger, risk rating change, override submission
- Frontend: bell icon in header, dropdown with notification list, unread count badge

### Data Freshness

- Store `lastCalculatedAt` timestamp on residual_risk and control_environment_rating tables
- Display "Last Calculated: X hours ago" on dashboard views
- Configurable staleness threshold (default: 24 hours)

### Enhanced Scenarios

- Scenario configuration stored in new `scenarios` table
- Overlay mode: render multiple scenario datasets on same Recharts chart with different colors
- Save/load scenario configurations

### Input Validation

- Zod schemas for all API request bodies
- Custom validators for CRAF-specific business rules (valid score bands, consistent control attributes)
- Frontend form validation matching backend rules

## MVP3 Design Considerations

Architectural notes for MVP3 (Enterprise Polish) features.

### Theme Customization

- CSS custom properties for primary/accent colors
- Dark mode via Tailwind `dark:` variant
- User preference stored in `user_preferences` table

### User Management

- CRUD API for users at `/api/admin/users`
- Admin page accessible to GCCO only
- Password hashing with bcrypt, complexity validation

### Configurable Thresholds

- New `system_config` table: key, value, description, updatedBy, updatedAt
- Config keys for all scoring thresholds, weights, materiality parameters
- Recalculation trigger on config change

### Dashboard Personalization

- `user_preferences` table: userId, key, value
- Saved filter presets, favorite AUs, last-used view settings
- Frontend: "Save as preset" button on filter bars

### Performance Optimization

- Redis caching for dashboard aggregation endpoints (TTL: 5 min)
- Database indexes on: (au_id, period_id) for all assessment tables, (theme_id) for obligations
- API rate limiting: 100 req/min per user
- Query optimization: materialized views for enterprise-level aggregations

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Likelihood parameter scoring bands

*For any* raw input value for each of the 6 likelihood parameters (volume growth %, regulatory returns count, compliance breach count, ICOFR failure count, customer complaint count), the assigned score must fall within {5, 10, 15, 20, 25} and match the defined band thresholds for that parameter.

**Validates: Requirements 4.2, 4.4, 4.5, 4.6, 4.7**

### Property 2: Likelihood scaling and rating

*For any* average of 6 likelihood parameter scores (each in {5, 10, 15, 20, 25}), the scaled likelihood score must match the defined scaling table, and the resulting rating must match the score-to-rating mapping (25→Almost Certain, 20→Likely, 15→Possible, 10→Unlikely, 5→Rare).

**Validates: Requirements 4.8, 4.9**

### Property 3: Complexity score is max of product and system complexity

*For any* Assessment Unit with both a product complexity score and a system complexity score, the complexity parameter used in likelihood must equal the maximum of the two.

**Validates: Requirements 4.3**

### Property 4: Impact score is max of four parameters

*For any* set of 4 impact parameter scores (business impact, media coverage, financial penalty, G/L impact), the overall impact score must equal the maximum of the four values.

**Validates: Requirements 5.6**

### Property 5: Inherent risk score and rating

*For any* scaled likelihood score and impact score (both in {5, 10, 15, 20, 25}), the inherent risk score must equal likelihood × impact, and the rating must match the defined thresholds (≥375→Extremely High, ≥200→Very High, ≥100→High, ≥25→Minor, <25→Insignificant).

**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6**

### Property 6: System complexity weighted average and rounding

*For any* system with 3 parameter scores (interfaces, tier, change requests), the final score must equal the weighted average of the 3 scores rounded up to the next multiple of 5. For any AU with multiple systems, the final complexity score must be the simple average of all system final scores scaled to the nearest standard band.

**Validates: Requirements 7.5, 7.6**

### Property 7: Product complexity calculation and categorization

*For any* set of product complexity parameter scores (each in {1, 3, 9}), the raw score must equal the product of all parameters (5 for Business Groups, 4 for Ops/Support excluding product variants), and the category must match the defined thresholds for the AU type (Business Group: ≤243 Low, 244-2187 Medium, >2188 High; Ops/Support: ≤81 Low, 82-729 Medium, >729 High).

**Validates: Requirements 8.3, 8.4, 8.5, 8.6**

### Property 8: Materiality calculation correctness

*For any* positive Profit Before Tax and total assets values, revenue materiality must equal PBT × 0.05, balance sheet materiality must equal totalAssets × 0.005, and final materiality values must equal the computed values × (1 − haircut/100).

**Validates: Requirements 9.1, 9.2, 9.3**

### Property 9: Significant account identification at threshold

*For any* account at Level 3 of the trial balance, it must be flagged as significant if and only if its amount exceeds the final materiality threshold. For accounts not significant at Level 3, aggregation at Level 2 must be applied and the threshold re-checked.

**Validates: Requirements 9.5, 9.6**

### Property 10: CQA raw score and scaling

*For any* control with 4 CQA parameter scores (monitoring in {1,3,5}, automation in {1,3,5}, type in {1,3,5}, documentation in {1,5}), the CQA raw score must equal the product of the 4 scores, and the scaled score must match the defined thresholds (<9→5, ≥9&<81→10, ≥81&<225→15, ≥225&<500→20, ≥500→25).

**Validates: Requirements 10.6, 10.7, 10.8**

### Property 11: CQI calculation and interpretation

*For any* set of controls with CQA raw scores, the weighted average must use the correct category weights (No Control 100%, <15→80%, ≥15&<30→60%, ≥30&<60→40%, ≥60&<125→30%, =125→20%), CQI must equal 100% minus the weighted average, and the interpretation score must match the defined thresholds (<40%→1, ≥40%→4, ≥60%→9, ≥70%→16, ≥80%→25).

**Validates: Requirements 11.1, 11.2, 11.3**

### Property 12: CPA scoring matrix

*For any* combination of control risk type (Compliance/ICOFR/Converged), KCI linked status, KCI result, and self-assessment result, the KCI/self-assessment score must match the defined scoring matrix. *For any* control testing result, the testing score must match (Pass→5, Pass with Exception→3, Fail→1, Not Tested→5). The CPA raw score must equal the product of the two scores, and the scaled score must match the defined thresholds.

**Validates: Requirements 12.1-12.12, 13.1, 13.2, 13.3, 13.4**

### Property 13: CPI calculation and interpretation

*For any* set of controls with CPA scores, the weighted average must use the correct category weights (No Control 100%, ≥5&<45→80%, ≥45&<225→60%, ≥225&<250→40%, ≥250&<375→30%, ≥375→20%), CPI must equal 100% minus the weighted average, and the interpretation score must match the defined thresholds.

**Validates: Requirements 14.1, 14.2, 14.3**

### Property 14: CER calculation and rating

*For any* CQI interpretation score and CPI interpretation score, CER must equal CQI × CPI, and the rating must match the defined thresholds (<15→Significant Improvement Needed, ≥15&<30→Improvement Needed, ≥30&<60→Partially Effective, ≥60&<125→Meets Requirement, ≥125→Effective).

**Validates: Requirements 15.1, 15.2**

### Property 15: Residual risk calculation and rating

*For any* inherent risk score and CER score where CER > 0, residual risk must equal IR ÷ CER, and the rating must match the defined thresholds (≥6.67→Significant Improvement Needed, <6.67&>2→Improvement Needed, ≤2&>1→Meets Requirement, ≤1→Well Controlled). When CER = 0 or no control exists, the rating must be "No Control" (edge case: no division attempted).

**Validates: Requirements 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 32.1**

### Property 16: Residual risk aggregation

*For any* set of controls with residual risk ratings, the aggregate residual risk must equal sum(count_per_category × category_weight) ÷ total_controls using the defined weights (No Control 100%, Significant Improvement 80%, Improvement 60%, Meets Requirement 25%, Well Controlled 1%), and the aggregate rating must match the defined thresholds (≥70%→Extremely High, ≥45%→High, >5%→Medium, >1%→Low, ≤1%→Negligible).

**Validates: Requirements 17.1, 17.2, 17.3**

### Property 17: Rating override triggers downstream recalculation

*For any* rating override applied to an AU, the downstream residual risk aggregation must reflect the overridden rating rather than the original computed rating.

**Validates: Requirements 18.3**

### Property 18: Heatmap color mapping

*For any* Assessment Unit with a residual risk rating, the heatmap color must match the defined mapping (Extremely High→Red, Very High→Orange, High→Yellow, Minor→Light Green, Insignificant→Green).

**Validates: Requirements 19.2**

### Property 19: Dashboard filtering returns matching results

*For any* filter combination of business area, risk rating, and theme applied to the dashboard, all returned AUs must match every active filter criterion, and no matching AUs should be excluded.

**Validates: Requirements 19.7, 19.8**

### Property 20: Year-over-year delta calculation

*For any* two assessment periods and any metric, the delta percentage must equal ((current − previous) / previous) × 100, and deterioration must be highlighted differently from improvement.

**Validates: Requirements 21.1, 21.2**

### Property 21: Early warning — deteriorating risk trend

*For any* Assessment Unit where the current period's aggregate residual risk score exceeds the previous period's by more than 10%, the early warning service must flag it with a deteriorating risk trend indicator.

**Validates: Requirements 22.1**

### Property 22: Early warning — approaching failure threshold

*For any* control whose CPA scaled score has decreased across two or more consecutive assessment periods, the early warning service must flag it as approaching failure threshold.

**Validates: Requirements 22.2**

### Property 23: Early warning — breach trend

*For any* Assessment Unit showing increasing compliance breach counts over consecutive periods, the early warning service must display a breach trend warning.

**Validates: Requirements 22.3**

### Property 24: RBI compliance score calculation

*For any* set of compliance obligations, the RBI compliance score must equal (number of obligations in compliance ÷ total obligations) × 100.

**Validates: Requirements 23.1**

### Property 25: Recent breaches filtered to 90 days

*For any* set of compliance breaches, the RBI compliance dashboard must return only breaches with timestamps within the last 90 days.

**Validates: Requirements 23.3**

### Property 26: Seed data mathematical consistency

*For any* Assessment Unit in the seed data, all computed scores must be mathematically consistent: inherent risk = likelihood × impact, CQA raw = product of 4 params, CQI = 100% − weighted avg CQA, CPA raw = KCI/SA score × testing score, CPI = 100% − weighted avg CPA, CER = CQI interp × CPI interp, residual risk = IR ÷ CER.

**Validates: Requirements 27.6**

### Property 27: RBAC middleware enforcement

*For any* API request with a given user role, resource, and action, the RBAC middleware must allow the request if and only if the role-permission matrix grants that role access to that resource and action. For AUHead role, requests to non-assigned AUs must be denied regardless of resource permissions.

**Validates: Requirements 31.1, 31.2, 31.3, 31.4, 31.5**

### Property 28: Structured API error responses

*For any* API request that results in an error (validation, authentication, authorization, not found, calculation, or server error), the response must contain a valid HTTP status code, a machine-readable error code, and a human-readable message in the defined format.

**Validates: Requirements 32.2, 32.5**

### Property 29: Obligation-to-theme mapping invariant

*For any* compliance obligation, it must be mapped to exactly one of the 21 regulatory themes.

**Validates: Requirements 2.4**

### Property 30: Assessment Unit business area invariant

*For any* Assessment Unit, its business area must be one of: Retail Banking, Corporate/Wholesale Banking, Treasury and Markets, or Support Functions.

**Validates: Requirements 1.3**

### Property 31: Override requires reason

*For any* rating override submission, the system must reject the override if the reason field is empty or missing, and accept it only when a non-empty reason is provided.

**Validates: Requirements 18.1**

### Property 32: Obligations sorted by criticality

*For any* Assessment Unit, the API must return its compliance obligations sorted by criticality (Critical > High > Medium > Low).

**Validates: Requirements 2.3**

### Property 33: Audit trail records all write operations (MVP2)

*For any* write operation (create, update, delete) performed by any user, the audit trail must contain an entry with action type, affected entity, user ID, timestamp, and before/after values.

**Validates: Requirements 34.1**

### Property 34: Notification on risk rating change (MVP2)

*For any* residual risk rating change of one or more levels, the notification service must create notifications for the GCCO and the relevant AU head.

**Validates: Requirements 36.2**

### Property 35: Data freshness staleness warning (MVP2)

*For any* dashboard response where the lastCalculatedAt timestamp is older than the configurable staleness threshold, the response must include a warning indicator.

**Validates: Requirements 37.1, 37.2, 37.3**

### Property 36: Score parameter validation (MVP2)

*For any* score parameter input, the system must reject values that fall outside the allowed set for that parameter type (e.g., {1,3,5} for CQA parameters, {5,10,15,20,25} for likelihood parameters) and accept all valid values.

**Validates: Requirements 39.1**

### Property 37: Scenario configuration round-trip (MVP2)

*For any* saved scenario configuration, loading it must produce an identical configuration to what was saved.

**Validates: Requirements 38.3**

### Property 38: Configurable threshold persistence and recalculation (MVP3)

*For any* threshold or weight configuration change, the new values must be persisted, and all affected scores and ratings must be recalculated using the updated values.

**Validates: Requirements 42.1, 42.2, 42.3, 42.4**

### Property 39: User preference round-trip (MVP3)

*For any* user, saving a theme preference, filter preset, or favorite AU and then retrieving it must return the same value that was saved.

**Validates: Requirements 40.3, 43.1, 43.2, 43.3**

### Property 40: API rate limiting (MVP3)

*For any* user exceeding the configured rate limit (100 requests/minute), subsequent requests must be rejected with HTTP 429 status until the rate window resets.

**Validates: Requirements 44.3**

## Testing Strategy

### Dual Testing Approach

The CRAF prototype uses both unit tests and property-based tests for comprehensive coverage:

- **Unit tests** (Vitest): Verify specific examples, edge cases, integration points, and error conditions. Focus on seed data verification, API endpoint existence, UI component rendering, and specific demo scenario calculations.
- **Property-based tests** (fast-check + Vitest): Verify universal properties across randomly generated inputs. Focus on all CRAF calculation formulas, scoring band mappings, RBAC enforcement, data integrity invariants, and round-trip properties.

### Property-Based Testing Configuration

- **Library**: `fast-check` with Vitest test runner
- **Minimum iterations**: 100 per property test
- **Tag format**: Each property test must include a comment: `// Feature: craf-prototype, Property {N}: {title}`
- **Each correctness property maps to exactly one property-based test**

### Unit Test Focus Areas

- Seed data counts: 89 AUs, 21 themes, 100+ obligations, 300+ controls, 8 users, 2 periods
- Demo scenario specific values: Scenario 1 CQI improvement, Scenario 2 CPA degradation, Scenario 3 what-if outcomes
- API endpoint existence and response shape validation
- Error boundary rendering
- Edge cases: CER = 0 division handling, score clamping for out-of-bounds values

### Property Test Focus Areas

- All CRAF calculation engine functions (Properties 1-16): scoring bands, scaling, multiplication, weighted averages, rating thresholds
- RBAC middleware enforcement (Property 27): role-permission matrix correctness
- Data integrity invariants (Properties 29, 30): business area and theme constraints
- Early warning detection (Properties 21-23): threshold-based flagging
- Dashboard filtering (Property 19): filter correctness
- Round-trip properties (Properties 37, 39): configuration and preference persistence
- API error response format (Property 28): structured error responses

### Test File Organization

```
server/src/__tests__/
├── properties/
│   ├── likelihood.property.test.ts     # Properties 1, 2, 3
│   ├── impact.property.test.ts         # Properties 4, 5
│   ├── system-complexity.property.test.ts  # Property 6
│   ├── product-complexity.property.test.ts # Property 7
│   ├── materiality.property.test.ts    # Properties 8, 9
│   ├── cqa.property.test.ts            # Property 10
│   ├── cqi.property.test.ts            # Property 11
│   ├── cpa.property.test.ts            # Property 12
│   ├── cpi.property.test.ts            # Property 13
│   ├── cer.property.test.ts            # Property 14
│   ├── residual-risk.property.test.ts  # Properties 15, 16
│   ├── override.property.test.ts       # Properties 17, 31
│   ├── dashboard.property.test.ts      # Properties 18, 19, 20
│   ├── early-warning.property.test.ts  # Properties 21, 22, 23
│   ├── compliance.property.test.ts     # Properties 24, 25
│   ├── seed-data.property.test.ts      # Property 26
│   ├── rbac.property.test.ts           # Property 27
│   ├── error-handling.property.test.ts # Property 28
│   └── data-integrity.property.test.ts # Properties 29, 30, 32
├── unit/
│   ├── seed-data.test.ts              # Seed data counts and structure
│   ├── scenarios.test.ts             # Demo scenario specific values
│   ├── api-endpoints.test.ts         # Endpoint existence and response shapes
│   └── edge-cases.test.ts            # CER=0, score clamping, empty inputs
```
