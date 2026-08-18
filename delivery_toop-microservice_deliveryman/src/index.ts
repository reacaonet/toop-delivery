/* eslint-disable new-cap */
import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';

import createServer from './server';
import routes from './routes/index.routes';
import Start from './services/Cron';
import lookForDrivers from './services/driver/lookForDrivers';
import cancelBooking from './services/driver/cancelBooking';

// Start cron jobs
Start();
lookForDrivers();
cancelBooking();

// Start Express server
const app = express();
const corsConfig = {
  origin: '*',
  methods: 'POST, GET, PUT, DELETE, OPTIONS, PATCH',
};

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
