import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('ErrorHandler');

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.requestId || 'req-unknown';
  const status = err.status || err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  // Sanitize user message
  let message = err.message || 'An internal server error occurred.';
  if (status >= 500 && process.env.NODE_ENV === 'production') {
    message = 'An unexpected server error occurred while processing the request.';
  }

  logger.error(`Request ${requestId} failed [${status}]: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      requestId,
    },
  });
}
