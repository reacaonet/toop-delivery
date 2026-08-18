import 'express-group-routes';
import * as HealthController from './app/controllers/HealthController';
import * as AppController from './app/controllers/AppController';

/** Topic */
import userRegisterTopicController from './app/controllers/Topic/UserRegisterTopicController';
import messageTopicController from './app/controllers/Topic/MessageTopicController';
import unsubscribeController from './app/controllers/Topic/UnsubscribeTopicController';
import getTokenTopics from './app/controllers/Topic/GetTokenTopics';

import authMiddleware from './middleware/auth';

async function Routes(Route) {
  Route.get('/health', HealthController.Show);

  Route.group('/v1', (v1) => {

    v1.get('/health', HealthController.Show);

    v1.group('/app-notification', (app) => {
      app.post('/general', authMiddleware, AppController.General);
      app.post('/user/:id', authMiddleware, AppController.UserId);
      app.post('/push', authMiddleware, AppController.Push);
    });

    v1.group('/topic', (app) => {
      app.get('/token-list', authMiddleware, getTokenTopics);
      app.post('/user-register', authMiddleware, userRegisterTopicController);
      app.post('/notification', authMiddleware, messageTopicController);
      app.post('/unsubscribe', authMiddleware, unsubscribeController);
    });

  });
}

export default Routes;
