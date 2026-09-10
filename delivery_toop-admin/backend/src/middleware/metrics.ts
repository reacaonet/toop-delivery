import { Request, Response, NextFunction } from "express";

/* ------------------------------------------------------------------ */
/*  Histogram buckets (seconds) — padrão Prometheus                   */
/* ------------------------------------------------------------------ */
const DURATION_BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];

/* ------------------------------------------------------------------ */
/*  In-memory metric stores                                            */
/* ------------------------------------------------------------------ */

// Per-route counters: key = "method|route|status"
const requestCounters = new Map<string, number>();

// Per-route histogram: key = "method|route|le"  (le = bucket upper bound or "+Inf")
const durationBuckets = new Map<string, number>();

// Process gauges (updated on each /metrics scrape)
function getProcessMetrics() {
  const mem = process.memoryUsage();
  const cpu = process.cpuUsage();
  const uptime = process.uptime();
  return { mem, cpu, uptime };
}

/* ------------------------------------------------------------------ */
/*  Business counters — importable by services                         */
/* ------------------------------------------------------------------ */
export const businessCounters = {
  orders_created: 0,
  orders_completed: 0,
  orders_cancelled: 0,
  payments_completed: 0,
  payments_refunded: 0,
  deliveries_completed: 0,
  deliveries_cancelled: 0,
  drivers_online: 0,
};

export function incOrder(status: "created" | "completed" | "cancelled") {
  if (status === "created") businessCounters.orders_created++;
  else if (status === "completed") businessCounters.orders_completed++;
  else if (status === "cancelled") businessCounters.orders_cancelled++;
}

export function incPayment(status: "completed" | "refunded") {
  if (status === "completed") businessCounters.payments_completed++;
  else if (status === "refunded") businessCounters.payments_refunded++;
}

export function incDelivery(status: "completed" | "cancelled") {
  if (status === "completed") businessCounters.deliveries_completed++;
  else if (status === "cancelled") businessCounters.deliveries_cancelled++;
}

export function setDriversOnline(count: number) {
  businessCounters.drivers_online = count;
}

/* ------------------------------------------------------------------ */
/*  Route normalization — turns /users/abc123 into /users/:id          */
/* ------------------------------------------------------------------ */
function normalizeRoute(path: string): string {
  return path
    .replace(/\/[0-9a-f]{24}/gi, "/:id")
    .replace(/\/[0-9]+/g, "/:id");
}

/* ------------------------------------------------------------------ */
/*  Middleware — collect per-request metrics                            */
/* ------------------------------------------------------------------ */
export function metricsCollector(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const elapsed = Number(process.hrtime.bigint() - start) / 1e9;
    const method = req.method;
    const route = normalizeRoute(req.route?.path || req.path || "unknown");
    const status = String(res.statusCode);

    const routeKey = `${method}|${route}`;
    const statusKey = `${method}|${route}|${status}`;

    // Increment request counter
    requestCounters.set(statusKey, (requestCounters.get(statusKey) || 0) + 1);

    // Increment histogram buckets
    for (const bucket of DURATION_BUCKETS) {
      if (elapsed <= bucket) {
        const key = `${routeKey}|${bucket}`;
        durationBuckets.set(key, (durationBuckets.get(key) || 0) + 1);
      }
    }
    // "+Inf" bucket always incremented
    const infKey = `${routeKey}|+Inf`;
    durationBuckets.set(infKey, (durationBuckets.get(infKey) || 0) + 1);

    // Sum and count for average calculation
    const sumKey = `${routeKey}|_sum`;
    const cntKey = `${routeKey}|_count`;
    durationBuckets.set(sumKey, (durationBuckets.get(sumKey) || 0) + elapsed);
    durationBuckets.set(cntKey, (durationBuckets.get(cntKey) || 0) + 1);
  });

  next();
}

/* ------------------------------------------------------------------ */
/*  /metrics endpoint — Prometheus text exposition format              */
/* ------------------------------------------------------------------ */
export function metricsEndpoint(_req: Request, res: Response): void {
  const lines: string[] = [];

  const push = (s: string) => lines.push(s);

  // --- HTTP requests counter (per route + status) ---
  push("# HELP toop_http_requests_total Total HTTP requests");
  push("# TYPE toop_http_requests_total counter");

  // Aggregate by status across all routes
  const statusAgg = new Map<string, number>();
  for (const [key, val] of requestCounters) {
    const parts = key.split("|");
    const st = parts[2];
    statusAgg.set(st, (statusAgg.get(st) || 0) + val);
  }
  for (const [st, val] of statusAgg) {
    push(`toop_http_requests_total{status="${st}"} ${val}`);
  }

  push("");
  push("# HELP toop_http_requests_by_route_total Requests per route");
  push("# TYPE toop_http_requests_by_route_total counter");

  const routeAgg = new Map<string, number>();
  for (const [key, val] of requestCounters) {
    const parts = key.split("|");
    const rk = `${parts[0]}|${parts[1]}`;
    routeAgg.set(rk, (routeAgg.get(rk) || 0) + val);
  }
  for (const [rk, val] of routeAgg) {
    const [m, r] = rk.split("|");
    push(`toop_http_requests_by_route_total{method="${m}",route="${r}"} ${val}`);
  }

  // --- Duration histogram (per route) ---
  push("");
  push("# HELP toop_http_request_duration_seconds Request latency histogram");
  push("# TYPE toop_http_request_duration_seconds histogram");

  const routeSet = new Set<string>();
  for (const [key] of durationBuckets) {
    if (key.endsWith("|_sum") || key.endsWith("|_count")) continue;
    const parts = key.split("|");
    routeSet.add(`${parts[0]}|${parts[1]}`);
  }

  for (const rk of routeSet) {
    const [m, r] = rk.split("|");
    const label = `method="${m}",route="${r}"`;
    for (const bucket of DURATION_BUCKETS) {
      const bKey = `${rk}|${bucket}`;
      const cumulative = durationBuckets.get(bKey) || 0;
      push(`toop_http_request_duration_seconds_bucket{${label},le="${bucket}"} ${cumulative}`);
    }
    const infVal = durationBuckets.get(`${rk}|+Inf`) || 0;
    push(`toop_http_request_duration_seconds_bucket{${label},le="+Inf"} ${infVal}`);
    const sumVal = durationBuckets.get(`${rk}|_sum`) || 0;
    const cntVal = durationBuckets.get(`${rk}|_count`) || 0;
    push(`toop_http_request_duration_seconds_sum{${label}} ${sumVal.toFixed(6)}`);
    push(`toop_http_request_duration_seconds_count{${label}} ${cntVal}`);
  }

  // --- Process metrics ---
  const proc = getProcessMetrics();

  push("");
  push("# HELP toop_process_resident_memory_bytes Resident memory (RSS)");
  push("# TYPE toop_process_resident_memory_bytes gauge");
  push(`toop_process_resident_memory_bytes ${proc.mem.rss}`);

  push("");
  push("# HELP toop_process_heap_used_bytes Heap used");
  push("# TYPE toop_process_heap_used_bytes gauge");
  push(`toop_process_heap_used_bytes ${proc.mem.heapUsed}`);

  push("");
  push("# HELP toop_process_heap_total_bytes Heap total");
  push("# TYPE toop_process_heap_total_bytes gauge");
  push(`toop_process_heap_total_bytes ${proc.mem.heapTotal}`);

  push("");
  push("# HELP toop_process_cpu_seconds_total CPU seconds (user + system)");
  push("# TYPE toop_process_cpu_seconds_total counter");
  push(`toop_process_cpu_seconds_total ${(proc.cpu.user + proc.cpu.system) / 1e6}`);

  push("");
  push("# HELP toop_process_uptime_seconds Process uptime");
  push("# TYPE toop_process_uptime_seconds gauge");
  push(`toop_process_uptime_seconds ${proc.uptime.toFixed(1)}`);

  // --- Business metrics ---
  push("");
  push("# HELP toop_orders_total Orders by status");
  push("# TYPE toop_orders_total counter");
  push(`toop_orders_total{status="created"} ${businessCounters.orders_created}`);
  push(`toop_orders_total{status="completed"} ${businessCounters.orders_completed}`);
  push(`toop_orders_total{status="cancelled"} ${businessCounters.orders_cancelled}`);

  push("");
  push("# HELP toop_payments_total Payments by status");
  push("# TYPE toop_payments_total counter");
  push(`toop_payments_total{status="completed"} ${businessCounters.payments_completed}`);
  push(`toop_payments_total{status="refunded"} ${businessCounters.payments_refunded}`);

  push("");
  push("# HELP toop_deliveries_total Deliveries by status");
  push("# TYPE toop_deliveries_total counter");
  push(`toop_deliveries_total{status="completed"} ${businessCounters.deliveries_completed}`);
  push(`toop_deliveries_total{status="cancelled"} ${businessCounters.deliveries_cancelled}`);

  push("");
  push("# HELP toop_drivers_online Currently online drivers");
  push("# TYPE toop_drivers_online gauge");
  push(`toop_drivers_online ${businessCounters.drivers_online}`);

  // --- Legacy compatibility (for any existing dashboards) ---
  push("");
  push("# HELP http_requests_total Legacy total requests counter");
  push("# TYPE http_requests_total counter");
  let totalReqs = 0;
  for (const val of requestCounters.values()) totalReqs += val;
  push(`http_requests_total ${totalReqs}`);

  push("");
  push("# HELP http_request_duration_seconds_avg Legacy average duration");
  push("# TYPE http_request_duration_seconds_avg gauge");
  let totalSum = 0;
  let totalCount = 0;
  for (const [key, val] of durationBuckets) {
    if (key.endsWith("|_sum")) totalSum += val;
    if (key.endsWith("|_count")) totalCount += val;
  }
  push(`http_request_duration_seconds_avg ${totalCount > 0 ? (totalSum / totalCount).toFixed(4) : "0"}`);

  res.setHeader("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
  res.send(lines.join("\n"));
}
