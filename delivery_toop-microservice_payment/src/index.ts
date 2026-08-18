import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';

import createServer from './server';
import routes from './routes/index.routes';

import connect from './database/Connection';
import {connectPostgres} from './database/Postgres';

// Service Queue
import startQueue from './services/queueSplit';

const app = express();
const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:4202', 'http://localhost:3000'],
  methods: 'POST, GET, PUT, DELETE, OPTIONS, PATCH',
};

connect();
connectPostgres();

app
  .use([
    compression(),
    helmet(),
    cors(corsConfig),
    bodyParser.json({limit: '10mb'}),
    bodyParser.urlencoded({limit: '10mb', extended: false}),
  ])
  .disable('x-powered-by');

routes(app);
createServer(app);

setTimeout(() => {
  startQueue();
}, 1000);
