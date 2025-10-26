import cron from 'node-cron';
import { alertService } from '../services/alertService.js';
import { userService } from '../services/userService.js';
import { creaoClient } from '../services/creaoClient.js';
import { twilioService } from '../services/twilioService.js';
import { logger } from '../lib/logger.js';
import { config } from '../config.js';
function buildPrompt(alert) {
    return `Write a student-friendly SMS (<=160 chars) about ${alert.title} at ${alert.location}.
Highlight: ${alert.summary}.
Tags: ${alert.tags.join(', ') || 'general'}.
Mention city ${config.DEFAULT_CITY}.`;
}
async function dispatchAlert(alertId) {
    const alert = await alertService.getAlert(alertId);
    if (!alert) {
        logger.warn({ alertId }, 'Alert not found');
        return;
    }
    const prompt = buildPrompt({ ...alert, tags: alert.tags.split(",") });
    const generated = await creaoClient.generate({ prompt, max_tokens: 120, temperature: 0.4 });
    const recipients = await userService.findSubscribedUsersByTags(alert.tags.split(","));
    await Promise.all(recipients.map(async (user) => {
        try {
            await twilioService.sendSms({ to: user.phone, body: `${generated} Reply STOP to opt out.` });
        }
        catch (err) {
            logger.error({ err, userId: user.id, alertId }, 'Failed to send SMS');
        }
    }));
}
export function scheduleAlerts() {
    // For hackathon demo: run every 30 minutes.
    cron.schedule('*/30 * * * *', async () => {
        logger.info('Running scheduled alert dispatcher');
        const alerts = await alertService.listAlerts(5);
        await Promise.all(alerts.map((alert) => dispatchAlert(alert.id)));
    });
    logger.info('Alert scheduler registered (every 30 minutes)');
}
