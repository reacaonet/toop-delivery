import { Router } from 'express';
import mobilityDiscountController from '../controllers/mobility-discount.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/paginator', authenticate, mobilityDiscountController.paginator);
router.post('/', authenticate, mobilityDiscountController.create);
router.put('/:id', authenticate, mobilityDiscountController.update);

export default router;
