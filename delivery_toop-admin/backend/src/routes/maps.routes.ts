import { Router } from 'express';
import mapsController from '../controllers/maps.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/direction', authenticate, mapsController.direction);
router.post('/matrix', authenticate, mapsController.matrix);
router.post('/geo', authenticate, mapsController.geo);
router.post('/complete', authenticate, mapsController.complete);

export default router;
