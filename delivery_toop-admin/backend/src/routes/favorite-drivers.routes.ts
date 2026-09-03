import { Router } from 'express';
import favoriteDriversController from '../controllers/favorite-drivers.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/driver/:driver/passenger/:passenger', authenticate, favoriteDriversController.isFavorite);
router.post('/', authenticate, favoriteDriversController.toggleFavorite);

export default router;
