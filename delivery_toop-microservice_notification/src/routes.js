import 'express-group-routes';
import * as HealthController from './app/controllers/HealthController';
import * as AppController from './app/controllers/AppController';

/** Topic */
import userRegisterTopicController from './app/controllers/Topic/UserRegisterTopicController';
import messageTopicController from './app/controllers/Topic/MessageTopicController';
import unsubscribeController from './app/controllers/Topic/UnsubscribeTopicController';
import getTokenTopics from './app/controllers/Topic/GetTokenTopics';

async function Routes(Route) {
  Route.group('/v1', (v1) => {

    v1.get('/health', HealthController.Show);

    v1.group('/app-notification', (app) => {
      app.post('/general', AppController.General);
      app.post('/user/:id', AppController.UserId);
      app.post('/push', AppController.Push);
    });

    v1.group('/topic', (app) => {
      app.get('/token-list', getTokenTopics)
      app.post('/user-register', userRegisterTopicController);
      app.post('/notification', messageTopicController);
      app.post('/unsubscribe', unsubscribeController);
    });

  });
}

export default Routes;