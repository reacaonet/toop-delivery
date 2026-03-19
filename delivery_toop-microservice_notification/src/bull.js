import Queue from './config/queue';
import NotificationJob from './app/jobs/NotificationJob';

Queue.process(NotificationJob.handle);