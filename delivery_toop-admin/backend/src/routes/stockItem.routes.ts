import { Router } from 'express';
import stockItemController from '../controllers/stockItem.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/company/:companyId', stockItemController.listByCompany);
router.get('/:id', stockItemController.getById);
router.post('/', stockItemController.create);
router.put('/:id', stockItemController.update);
router.delete('/:id', stockItemController.delete);

export default router;
