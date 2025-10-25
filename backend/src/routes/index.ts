import { Router } from 'express';
import { usersRouter } from './users.js';
import { alertsRouter } from './alerts.js';
import { twilioRouter } from './twilio.js';
import { configRouter } from './config.js';
import { devRouter } from './dev.js';

const router = Router();

router.use('/users', usersRouter);
router.use('/alerts', alertsRouter);
router.use('/webhooks/twilio', twilioRouter);
router.use('/config', configRouter);
router.use('/dev', devRouter);

export { router };
