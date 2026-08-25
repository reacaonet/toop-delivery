import { Router } from 'express';
import stockMovementController from '../controllers/stockMovement.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/summary/:branchId', stockMovementController.getSummary);
router.get('/company/:companyId', stockMovementController.listByCompany);
router.get('/branch/:branchId', stockMovementController.listByBranch);
router.get('/:id', stockMovementController.getById);
router.post('/', stockMovementController.create);
router.post('/entry', stockMovementController.registerEntry);
router.post('/exit', stockMovementController.registerExit);

export default router;
