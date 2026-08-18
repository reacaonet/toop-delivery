import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 100;

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();

  if (!store[key] || store[key].resetTime < now) {
    store[key] = { count: 1, resetTime: now + WINDOW_MS };
    next();
    return;
  }

  store[key].count++;

  if (store[key].count > MAX_REQUESTS) {
    res.status(429).json({
      error: "Too many requests",
      retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
    });
    return;
  }

  next();
}

setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}, WINDOW_MS);
