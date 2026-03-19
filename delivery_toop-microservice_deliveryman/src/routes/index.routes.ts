import {Express, Router} from 'express';
import Health from '../controllers/Health';
import Token from '../controllers/Token';
import Deliveryman from '../controllers/Deliveryman';

function Routes(Route: Express): Router {
  return (
    Route.get(`/${process.env.LTS}/health`, Health.index),
    Route.post(`/${process.env.LTS}/token`, Token.index),
    Route.post(`/${process.env.LTS}/deliveryman/find`, Deliveryman.start)
  );
}

export default Routes;
