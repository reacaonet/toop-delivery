import { Router } from 'express';
import accessoriesController from '../controllers/accessories.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/:productId', authenticate, accessoriesController.complementList);

export default router;
