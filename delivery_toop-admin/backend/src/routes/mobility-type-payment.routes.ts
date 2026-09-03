import { Router } from 'express';
import mobilityTypePaymentController from '../controllers/mobility-type-payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, mobilityTypePaymentController.list);

export default router;
