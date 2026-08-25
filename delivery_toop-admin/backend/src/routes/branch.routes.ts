import { Router } from 'express';
import branchController from '../controllers/branch.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/company/:companyId', branchController.listByCompany);
router.get('/:id', branchController.getById);
router.post('/', branchController.create);
router.put('/:id', branchController.update);
router.delete('/:id', branchController.delete);

export default router;
