import { Router } from 'express';
import couponController from '../controllers/coupon.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/paginator', authenticate, couponController.list);
router.get('/search', authenticate, couponController.list);
router.get('/list/:id?', authenticate, couponController.get);
router.get('/display', authenticate, couponController.display);
router.get('/highCupon', authenticate, couponController.highCupon);
router.get('/companyCoupons/:id', authenticate, couponController.companyCoupons);
router.get('/couponCustomer', authenticate, couponController.couponCustomer);
router.get('/coupon-customer-paginator', authenticate, couponController.couponCustomerPaginator);
router.get('/:id', authenticate, couponController.get);
router.post('/', authenticate, couponController.create);
router.put('/update/:id', authenticate, couponController.update);
router.put('/:id', authenticate, couponController.update);
router.delete('/delete/:id', authenticate, couponController.remove);
router.delete('/:id', authenticate, couponController.remove);

export default router;
