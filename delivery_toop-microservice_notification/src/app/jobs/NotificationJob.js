import * as AppController from '../controllers/AppController';

export default {
  key: 'notification-app',
  async handle({ data }) {
    console.log(`[NotificationJob] Processing notification: ${JSON.stringify(data)}`);
  }
}
