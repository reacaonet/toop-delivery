import { Router } from 'express';
import shoppingPaymentMethodController from '../controllers/shopping-payment-method.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/:customer', shoppingPaymentMethodController.list);
router.post('/:customer', shoppingPaymentMethodController.create);
router.put('/:id', shoppingPaymentMethodController.update);
router.delete('/:id', shoppingPaymentMethodController.remove);

export default router;