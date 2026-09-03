import { Router } from 'express';
import peakHourController from '../controllers/peak-hour.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/listAll', authenticate, peakHourController.listAll);
router.get('/paginator', authenticate, peakHourController.paginator);
router.get('/:id?', authenticate, peakHourController.list);
router.post('/', authenticate, peakHourController.create);
router.put('/:id', authenticate, peakHourController.update);
router.delete('/:id', authenticate, peakHourController.remove);

export default router;
