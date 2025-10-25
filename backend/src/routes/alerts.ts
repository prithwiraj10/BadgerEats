import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { alertService } from '../services/alertService.js';

const alertsRouter = Router();

const createAlertSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  location: z.string().min(1),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  source: z.string().default('manual'),
});

alertsRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const alerts = await alertService.listAlerts();
    res.json(alerts);
  } catch (err) {
    next(err);
  }
});

alertsRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createAlertSchema.parse(req.body);
    const alert = await alertService.createAlert(data);
    res.status(201).json(alert);
  } catch (err) {
    next(err);
  }
});

export { alertsRouter };
