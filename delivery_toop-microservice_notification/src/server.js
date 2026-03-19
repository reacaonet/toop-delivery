import 'dotenv/config';
import express from 'express';
import HttpServer from './config/Server';

HttpServer(
    express()
);