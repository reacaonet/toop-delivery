import 'dotenv/config';

import Bull from 'bull';
import NotificationJob from '../app/jobs/NotificationJob';

const Queue = new Bull(NotificationJob.key, `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);

export default Queue;
