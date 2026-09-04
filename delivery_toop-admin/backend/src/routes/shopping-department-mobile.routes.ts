import { Router } from 'express';
import departmentMobileController from '../controllers/shopping-department-mobile.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/paginator', departmentMobileController.paginator);
router.get('/', departmentMobileController.list);
router.post('/', departmentMobileController.create);
router.put('/:id', departmentMobileController.update);
router.delete('/:id', departmentMobileController.remove);

export default router;