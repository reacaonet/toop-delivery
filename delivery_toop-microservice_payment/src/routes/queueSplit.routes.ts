/* eslint-disable new-cap */
import * as express from 'express';
const QueueSplitRoute = express.Router();
import CreateController from '../controllers/QueueSplit/CreateController';

QueueSplitRoute.post(`/`, CreateController);
export default QueueSplitRoute;
