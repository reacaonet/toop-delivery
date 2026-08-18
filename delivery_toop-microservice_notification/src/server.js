import 'dotenv/config';
import express from 'express';
import HttpServer from './config/Server';
import { ConnectDB } from './config/Database';

ConnectDB().catch((err) => {
  console.error('[DB] Connection failed:', err.message);
  process.exit(1);
});

HttpServer(
    express()
);