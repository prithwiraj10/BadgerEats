import express, { type Request, type Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { config } from './config.js';
import { logger } from './lib/logger.js';
import { router as apiRouter } from './routes/index.js';
import { errorHandler } from './lib/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!config.isProduction) {
  app.use(morgan('dev'));
}

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', apiRouter);

// Serve static frontend files in production
// Frontend should be built and placed in ../frontend/dist or ../frontend/build
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
const frontendBuildPath = path.join(__dirname, '../../frontend/build');

let frontendPath: string | null = null;
if (existsSync(frontendDistPath)) {
  frontendPath = frontendDistPath;
} else if (existsSync(frontendBuildPath)) {
  frontendPath = frontendBuildPath;
}

if (frontendPath) {
  logger.info({ path: frontendPath }, 'Serving static frontend files');
  app.use(express.static(frontendPath));
  
  // Catch-all route to serve index.html for client-side routing (SPA support)
  app.get('*', (req: Request, res: Response) => {
    // Skip API routes and health check
    if (req.path.startsWith('/api') || req.path === '/health') {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    res.sendFile(path.join(frontendPath!, 'index.html'));
  });
} else {
  logger.warn('Frontend build not found. API-only mode.');
  // API-only mode - return 404 for non-API routes
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: 'Not found' });
  });
}

app.use(errorHandler);

// Log unhandled rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (error: Error) => {
  logger.error({ error }, 'Uncaught exception');
});

export { app };
