import { Router, type Request, type Response, type NextFunction } from 'express';
import { config } from '../config.js';
import { twilioService } from '../services/twilioService.js';
import { logger } from '../lib/logger.js';

const devRouter = Router();

// Development-only endpoints. Protected by DEV_KEY and disabled in production.
devRouter.post('/send-test-sms', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (config.isProduction) {
      return res.status(403).json({ message: 'Forbidden in production' });
    }

    const devKey = req.header('x-dev-key') ?? '';
    if (config.DEV_KEY && devKey !== config.DEV_KEY) {
      return res.status(401).json({ message: 'Invalid dev key' });
    }

    const { to, body } = req.body as { to?: string; body?: string };
    if (!to || !body) {
      return res.status(400).json({ message: 'Missing to or body in request' });
    }

    const message = await twilioService.sendSms({ to, body });
    res.json({ message: 'queued', sid: message.sid });
  } catch (err) {
    logger.error({ err }, 'Dev send-test-sms failed');
    next(err);
  }
});

export { devRouter };
