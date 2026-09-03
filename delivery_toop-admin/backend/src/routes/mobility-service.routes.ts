import { Router } from 'express';
import mobilityServiceController from '../controllers/mobility-service.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/listAll', authenticate, mobilityServiceController.listAll);
router.get('/graphic', authenticate, mobilityServiceController.graphic);
router.get('/paginator', authenticate, mobilityServiceController.paginator);
router.get('/search', authenticate, mobilityServiceController.search);
router.get('/list-front', authenticate, mobilityServiceController.listFront);
router.get('/list/:id?', authenticate, mobilityServiceController.list);
router.get('/available', authenticate, mobilityServiceController.available);
router.get('/service-details/:id', authenticate, mobilityServiceController.serviceDetails);
router.get('/:id?', authenticate, mobilityServiceController.list);
router.post('/', authenticate, mobilityServiceController.create);
router.put('/:id', authenticate, mobilityServiceController.update);
router.delete('/:id', authenticate, mobilityServiceController.remove);

export default router;
