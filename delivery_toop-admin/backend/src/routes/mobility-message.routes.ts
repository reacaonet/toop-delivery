import { Router } from 'express';
import mobilityMessageController from '../controllers/mobility-message.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, mobilityMessageController.list);
router.get('/conversations', authenticate, mobilityMessageController.conversations);
router.post('/', authenticate, mobilityMessageController.create);

export default router;
