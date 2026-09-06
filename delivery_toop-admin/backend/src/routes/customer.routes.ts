import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import customerController from '../controllers/customer.controller';

const router = Router();

router.get('/search', customerController.search);
router.get('/paginator', authenticate, customerController.paginator);
router.get('/listPorNome', authenticate, customerController.listPorNome);
router.get('/list/:id', authenticate, customerController.list);
router.get('/list', authenticate, customerController.list);
router.post('/create', authenticate, customerController.create);
router.put('/update/:id', authenticate, customerController.update);
router.delete('/delete/:id', authenticate, customerController.remove);
router.get('/search-customer', authenticate, customerController.searchCustomer);
router.get('/search-person-customer', authenticate, customerController.searchPersonCustomer);

export default router;