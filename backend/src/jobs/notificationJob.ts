import cron from 'node-cron';
import { alertService, type AlertDto } from '../services/alertService.js';
import { userService, type UserDto } from '../services/userService.js';
import { creaoClient } from '../services/creaoClient.js';
import { twilioService } from '../services/twilioService.js';
import { logger } from '../lib/logger.js';
import { config } from '../config.js';

function buildPrompt(alert: { title: string; summary: string; location: string; tags: string[] }) {
  return `Write a student-friendly SMS (<=160 chars) about ${alert.title} at ${alert.location}.
Highlight: ${alert.summary}.
Tags: ${alert.tags.join(', ') || 'general'}.
Mention city ${config.DEFAULT_CITY}.`;
}

async function dispatchAlert(alertId: string): Promise<void> {
  const alert = await alertService.getAlert(alertId);
  if (!alert) {
    logger.warn({ alertId }, 'Alert not found');
    return;
  }

  const prompt = buildPrompt(alert);
  const generated = await creaoClient.generate({ prompt, max_tokens: 120, temperature: 0.4 });

  const recipients: UserDto[] = await userService.findSubscribedUsersByTags(alert.tags);

  await Promise.all(
    recipients.map(async (user: UserDto) => {
      try {
        await twilioService.sendSms({ to: user.phone, body: `${generated} Reply STOP to opt out.` });
      } catch (err: unknown) {
        logger.error({ err, userId: user.id, alertId }, 'Failed to send SMS');
      }
    }),
  );
}

export function scheduleAlerts(): void {
  // For hackathon demo: run every 30 minutes.
  cron.schedule('*/30 * * * *', async () => {
    logger.info('Running scheduled alert dispatcher');
    const alerts = await alertService.listAlerts(5);
    await Promise.all(alerts.map((alert: AlertDto) => dispatchAlert(alert.id)));
  });

  logger.info('Alert scheduler registered (every 30 minutes)');
}
