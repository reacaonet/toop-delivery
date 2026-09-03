import { Router } from 'express';
import alertProductController from '../controllers/alert-product.controller';

const router = Router();

router.get('/alert-product/notification', alertProductController.list);
router.post('/alert-product/notification', alertProductController.create);
router.put('/alert-product/notification/:idAlert', alertProductController.update);
router.get('/alert-product/report', alertProductController.report);

export default router;
