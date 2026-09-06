import { Router } from 'express';
import indicationController from '../controllers/indication.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, indicationController.list);
router.get('/paginator', authenticate, indicationController.paginator);

export default router;
