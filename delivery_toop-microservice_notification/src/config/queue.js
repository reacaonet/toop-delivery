import 'dotenv/config';

import Bull from 'bull';
import NotificationJob from '../app/jobs/NotificationJob';

const redisUrl = process.env.REDIS_PASSWORD
    ? `redis://:${encodeURIComponent(process.env.REDIS_PASSWORD)}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    : `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

const Queue = new Bull(NotificationJob.key, redisUrl);

export default Queue;
