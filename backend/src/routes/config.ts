import { Router, type Request, type Response } from 'express';
import { config } from '../config.js';

const configRouter = Router();

// Public, non-secret config for the frontend to consume.
configRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    defaultCity: config.DEFAULT_CITY,
    isProduction: config.isProduction,
  });
});

export { configRouter };
