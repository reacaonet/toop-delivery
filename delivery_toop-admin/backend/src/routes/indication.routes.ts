import { Router } from 'express';
import indicationController from '../controllers/indication.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, indicationController.list);

export default router;
