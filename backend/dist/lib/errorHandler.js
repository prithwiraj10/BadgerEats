import { logger } from './logger.js';
export class HttpError extends Error {
    constructor(status, message, details) {
        super(message);
        this.status = status;
        this.details = details;
        Object.setPrototypeOf(this, HttpError.prototype);
    }
}
export const errorHandler = (err, _req, res, _next) => {
    if (err instanceof HttpError) {
        logger.warn({ err }, 'Handled HTTP error');
        return res.status(err.status).json({ message: err.message, details: err.details });
    }
    logger.error({ err }, 'Unhandled error');
    return res.status(500).json({ message: 'Internal server error' });
};
