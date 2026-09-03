import { Router } from 'express';
import deliveryDispatchController from '../controllers/delivery-dispatch.controller';

const router = Router();

router.get('/paginator', deliveryDispatchController.registerPaginator);
router.post('/create', deliveryDispatchController.registerCreate);
router.get('/list', deliveryDispatchController.registerList);
router.get('/', deliveryDispatchController.registerList);
router.put('/status/:id', deliveryDispatchController.registerUpdateStatus);
router.put('/:id', deliveryDispatchController.registerUpdateStatus);

export default router;
