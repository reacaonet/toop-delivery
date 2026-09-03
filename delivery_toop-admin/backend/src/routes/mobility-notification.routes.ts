import { Router } from 'express';
import mobilityNotificationController from '../controllers/mobility-notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/listAll', authenticate, mobilityNotificationController.listAll);
router.get('/graphic', authenticate, mobilityNotificationController.graph);
router.get('/paginator', authenticate, mobilityNotificationController.paginator);
router.get('/search', authenticate, mobilityNotificationController.search);
router.get('/list/:id?', authenticate, mobilityNotificationController.list);
router.get('/:id?', authenticate, mobilityNotificationController.list);
router.post('/', authenticate, mobilityNotificationController.create);
router.put('/:id', authenticate, mobilityNotificationController.update);
router.delete('/:id', authenticate, mobilityNotificationController.remove);

export default router;
