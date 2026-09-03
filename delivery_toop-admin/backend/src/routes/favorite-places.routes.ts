import { Router } from 'express';
import favoritePlacesController from '../controllers/favorite-places.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, favoritePlacesController.list);
router.post('/', authenticate, favoritePlacesController.create);

export default router;
