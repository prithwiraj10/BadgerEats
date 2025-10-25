import express, { type Request, type Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config.js';
import { logger } from './lib/logger.js';
import { router as apiRouter } from './routes/index.js';
import { errorHandler } from './lib/errorHandler.js';

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

app.use(errorHandler);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Not found' });
});

// Log unhandled rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (error: Error) => {
  logger.error({ error }, 'Uncaught exception');
});

export { app };
