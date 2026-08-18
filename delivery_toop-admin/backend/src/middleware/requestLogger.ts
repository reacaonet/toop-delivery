import { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";

    console.log(JSON.stringify({
      level,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status,
      duration: `${duration}ms`,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.get("user-agent"),
      requestId: req.get("x-request-id"),
    }));
  });

  next();
}
