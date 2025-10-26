import { app } from './app.js';
import { config } from './config.js';
import { logger } from './lib/logger.js';
import { scheduleAlerts } from './jobs/notificationJob.js';
app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
    scheduleAlerts();
});
