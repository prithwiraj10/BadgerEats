import type { NextFunction, Request, Response } from 'express';
import { logger } from './logger.js';

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof HttpError) {
    logger.warn({ err }, 'Handled HTTP error');
    return res.status(err.status).json({ message: err.message, details: err.details });
  }

  logger.error({ err }, 'Unhandled error');
  return res.status(500).json({ message: 'Internal server error' });
};
