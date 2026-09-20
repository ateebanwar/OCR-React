import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const clients = new Map<string, RateLimitRecord>();

export function createRateLimiter(windowMs: number = 60000, maxRequests: number = 60) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let record = clients.get(ip);
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      clients.set(ip, record);
    } else {
      record.count++;
    }

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > maxRequests) {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please slow down and try again later.',
          requestId: req.requestId,
        },
      });
      return;
    }

    next();
  };
}

// Cleanup stale rate limit records periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of clients.entries()) {
    if (now > rec.resetTime) {
      clients.delete(ip);
    }
  }
}, 300000);
