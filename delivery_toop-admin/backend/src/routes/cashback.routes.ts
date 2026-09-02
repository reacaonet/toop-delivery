import { Router } from 'express';
import cashbackController from '../controllers/cashback.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/campaigns', authenticate, cashbackController.list);
router.get('/campaigns/listAll', authenticate, cashbackController.listAll);
router.get('/campaigns/paginator', authenticate, cashbackController.list);
router.get('/campaigns/:id', authenticate, cashbackController.get);
router.post('/campaigns', authenticate, cashbackController.create);
router.put('/campaigns/:id', authenticate, cashbackController.update);
router.delete('/campaigns/:id', authenticate, cashbackController.remove);

router.get('/used/paginator', authenticate, cashbackController.usedPaginator);
router.get('/customer/month/total/:customer', authenticate, cashbackController.byMonth);
router.get('/customer/balance/:customer', authenticate, cashbackController.balance);
router.get('/customer/:customer', authenticate, cashbackController.listCustomer);

export default router;
