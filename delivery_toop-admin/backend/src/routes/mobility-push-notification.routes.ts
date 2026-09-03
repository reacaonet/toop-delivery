import { Router } from 'express';
import mobilityPushNotificationController from '../controllers/mobility-push-notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/paginator', authenticate, mobilityPushNotificationController.paginator);
router.post('/', authenticate, mobilityPushNotificationController.create);

export default router;
