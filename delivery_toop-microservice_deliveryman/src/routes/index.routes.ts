import {Express, Router} from 'express';
import Health from '../controllers/Health';
import Token from '../controllers/Token';
import Deliveryman from '../controllers/Deliveryman';
import authMiddleware from '../middleware/auth';

function Routes(Route: Express): Router {
  // Public routes
  Route.get('/health', Health.index);
  Route.get(`/${process.env.LTS}/health`, Health.index);
  Route.post(`/${process.env.LTS}/token`, Token.index);

  // Protected routes
  Route.use(authMiddleware);
  Route.post(`/${process.env.LTS}/deliveryman/find`, Deliveryman.start);

  return Route;
}

export default Routes;
