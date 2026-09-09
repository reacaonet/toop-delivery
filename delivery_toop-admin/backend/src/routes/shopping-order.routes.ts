import { Router } from 'express';
import shoppingOrderController from '../controllers/shopping-order.controller';

const router = Router();

router.get('/', shoppingOrderController.list);
router.get('/own-delivery/:order', shoppingOrderController.getDeliveryModeValue);
router.get('/online-delivery/:order', shoppingOrderController.getDeliveryModeValue);
router.get('/cost-freight/:order', shoppingOrderController.costFreight);
router.get('/start-schedule-order/:order', shoppingOrderController.startScheduleOrder);
router.get('/:order', shoppingOrderController.getById);

router.put('/cost-freight/:order', shoppingOrderController.costFreight);
router.put('/own-delivery/:order', shoppingOrderController.setOwnDelivery);
router.put('/online-delivery/:order', shoppingOrderController.setOnlineDelivery);

export default router;