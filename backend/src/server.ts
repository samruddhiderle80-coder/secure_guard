import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

import { authRoutes } from './routes/auth';
import { assessmentRoutes } from './routes/assessment';
import { urlRoutes } from './routes/url';
import { dashboardRoutes } from './routes/dashboard';
import { historyRoutes } from './routes/history';
import { incidentRoutes } from './routes/incidents';
import { feedbackRoutes } from './routes/feedback';
import { trainingRoutes } from './routes/training';
import { phishingRoutes } from './routes/phishing';
import { adminRoutes } from './routes/admin';
import { mfaRoutes } from './routes/mfa';
import { privacyRoutes } from './routes/privacy';

export const server = Fastify({
  logger: {
    transport: env.NODE_ENV === 'development' && !process.env.VERCEL ? { target: 'pino-pretty' } : undefined,
  },
});

let isConfigured = false;
export async function configureApp() {
  if (isConfigured) return server;

  // Register Security Middlewares
  await server.register(helmet, {
    contentSecurityPolicy: false, // Vite handles dev CSP
  });

  await server.register(cors, {
    origin: [env.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173', '*'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await server.register(rateLimit, {
    max: 200,
    timeWindow: '1 minute',
  });

  server.setErrorHandler(errorHandler);

  // Healthcheck Route
  server.get('/health', async () => {
    return { status: 'healthy', app: 'Social Guard Security Engine', timestamp: new Date().toISOString() };
  });

  // Register Feature Routes
  await server.register(authRoutes);
  await server.register(assessmentRoutes);
  await server.register(urlRoutes);
  await server.register(dashboardRoutes);
  await server.register(historyRoutes);
  await server.register(incidentRoutes);
  await server.register(feedbackRoutes);
  await server.register(trainingRoutes);
  await server.register(phishingRoutes);
  await server.register(adminRoutes);
  await server.register(mfaRoutes);
  await server.register(privacyRoutes);

  isConfigured = true;
  return server;
}

export async function startServer() {
  await configureApp();
  try {
    const port = parseInt(env.PORT, 10);
    await server.listen({ port, host: env.HOST });
    server.log.info(`Social Guard Fastify Security Engine listening on ${env.HOST}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

// Auto-start only in standalone mode (not in Vercel Serverless environment)
if (!process.env.VERCEL) {
  startServer();
}
