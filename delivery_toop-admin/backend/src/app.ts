import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import routes from "./routes";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";
import { rateLimiter } from "./middleware/rateLimiter";
import { requestLogger } from "./middleware/requestLogger";
import { metricsCollector, metricsEndpoint } from "./middleware/metrics";

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(requestLogger);
app.use(rateLimiter);
app.use(metricsCollector);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/metrics", metricsEndpoint);

app.use("/", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
