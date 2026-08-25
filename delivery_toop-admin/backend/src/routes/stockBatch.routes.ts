import { Router } from 'express';
import stockBatchController from '../controllers/stockBatch.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/alerts/:companyId', stockBatchController.getLowStock);
router.get('/company/:companyId', stockBatchController.listByCompany);
router.get('/branch/:branchId', stockBatchController.listByBranch);
router.get('/:id', stockBatchController.getById);
router.post('/', stockBatchController.create);
router.put('/:id', stockBatchController.update);

export default router;
