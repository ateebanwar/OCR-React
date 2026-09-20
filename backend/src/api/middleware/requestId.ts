import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      processingId?: string;
    }
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const clientReqId = req.headers['x-request-id'];
  const requestId = typeof clientReqId === 'string' && clientReqId.length > 0
    ? clientReqId
    : `req-${crypto.randomUUID().slice(0, 10)}`;

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}
