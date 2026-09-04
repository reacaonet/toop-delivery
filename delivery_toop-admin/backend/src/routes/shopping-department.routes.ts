import { Router } from 'express';
import departmentController from '../controllers/shopping-department.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/paginator', departmentController.paginator);
router.get('/', departmentController.list);
router.post('/', departmentController.create);
router.put('/:id', departmentController.update);
router.delete('/:id', departmentController.remove);

export default router;