import { Router } from 'express';
import { usersRouter } from './users.js';
import { alertsRouter } from './alerts.js';
import { twilioRouter } from './twilio.js';

const router = Router();

router.use('/users', usersRouter);
router.use('/alerts', alertsRouter);
router.use('/webhooks/twilio', twilioRouter);

export { router };
