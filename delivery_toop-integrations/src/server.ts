import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config';
import routes from './routes';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) =>
  res.status(200).json({ status: 'ok', service: 'toop-integrations-api', timestamp: new Date().toISOString() })
);

app.use(routes);

app.use(
  (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err?.status || 400;
    res.status(status).json({ success: false, error: err?.message || 'Internal server error' });
  }
);

app.listen(env.PORT, () => {
  console.log(`Integrations API rodando na porta ${env.PORT}`);
});