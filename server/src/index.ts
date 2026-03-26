import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import assessmentUnitsRoutes from './routes/assessment-units.routes.js';
import themesRoutes from './routes/themes.routes.js';
import complianceRoutes from './routes/compliance.routes.js';
import controlsRoutes, { controlEnvironmentRouter as controlEnvironmentRoutes } from './routes/controls.routes.js';
import inherentRiskRoutes from './routes/inherent-risk.routes.js';
import residualRiskRoutes from './routes/residual-risk.routes.js';
import comparisonRoutes from './routes/comparison.routes.js';
import earlyWarningsRoutes from './routes/early-warnings.routes.js';
import ratingOverridesRoutes from './routes/rating-overrides.routes.js';
import materialityRoutes from './routes/materiality.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import scenariosRoutes from './routes/scenarios.routes.js';
import { notFoundHandler, errorHandler } from './middleware/error-handler.middleware.js';
import { responseTimeLogger } from './middleware/response-time.middleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Response time logging — logs duration and warns if >500ms (Req 28.4, 28.5)
app.use(responseTimeLogger);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/assessment-units', assessmentUnitsRoutes);
app.use('/api/themes', themesRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/controls', controlsRoutes);
app.use('/api/control-environment', controlEnvironmentRoutes);
app.use('/api/inherent-risk', inherentRiskRoutes);
app.use('/api/residual-risk', residualRiskRoutes);
app.use('/api/comparison', comparisonRoutes);
app.use('/api/early-warnings', earlyWarningsRoutes);
app.use('/api/rating-overrides', ratingOverridesRoutes);
app.use('/api/materiality', materialityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/scenarios', scenariosRoutes);

// Catch-all for unmatched routes — must come AFTER all route registrations
app.use(notFoundHandler);

// Global error handler — must be the LAST middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`CRAF server running on port ${PORT}`);
});

export default app;
