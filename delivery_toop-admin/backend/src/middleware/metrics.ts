import { Request, Response, NextFunction } from "express";

const metrics = {
  http_requests_total: 0,
  http_requests_by_status: {} as Record<string, number>,
  http_requests_by_method: {} as Record<string, number>,
  http_request_duration_seconds: [] as number[],
};

export function metricsCollector(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const status = String(res.statusCode);
    const method = req.method;

    metrics.http_requests_total++;
    metrics.http_requests_by_status[status] = (metrics.http_requests_by_status[status] || 0) + 1;
    metrics.http_requests_by_method[method] = (metrics.http_requests_by_method[method] || 0) + 1;
    metrics.http_request_duration_seconds.push(duration);

    if (metrics.http_request_duration_seconds.length > 1000) {
      metrics.http_request_duration_seconds = metrics.http_request_duration_seconds.slice(-500);
    }
  });

  next();
}

export function metricsEndpoint(_req: Request, res: Response): void {
  const avgDuration = metrics.http_request_duration_seconds.length > 0
    ? metrics.http_request_duration_seconds.reduce((a, b) => a + b, 0) / metrics.http_request_duration_seconds.length
    : 0;

  const p95Duration = metrics.http_request_duration_seconds.length > 0
    ? [...metrics.http_request_duration_seconds].sort((a, b) => a - b)[Math.floor(metrics.http_request_duration_seconds.length * 0.95)] || 0
    : 0;

  const lines = [
    "# HELP http_requests_total Total number of HTTP requests",
    "# TYPE http_requests_total counter",
    `http_requests_total ${metrics.http_requests_total}`,
    "",
    "# HELP http_request_duration_seconds Average request duration",
    "# TYPE http_request_duration_seconds gauge",
    `http_request_duration_seconds_avg ${avgDuration.toFixed(4)}`,
    `http_request_duration_seconds_p95 ${p95Duration.toFixed(4)}`,
    "",
  ];

  for (const [status, count] of Object.entries(metrics.http_requests_by_status)) {
    lines.push(`http_requests_total{status="${status}"} ${count}`);
  }

  for (const [method, count] of Object.entries(metrics.http_requests_by_method)) {
    lines.push(`http_requests_total{method="${method}"} ${count}`);
  }

  res.setHeader("Content-Type", "text/plain");
  res.send(lines.join("\n"));
}
