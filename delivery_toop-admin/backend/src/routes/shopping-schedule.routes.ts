import { Router } from 'express';
import scheduleController from '../controllers/shopping-schedule.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/all', scheduleController.all);
router.get('/have/:company', scheduleController.haveSchedule);
router.get('/:company', scheduleController.list);
router.post('/:company', scheduleController.create);
router.put('/type', scheduleController.updateType);
router.put('/:id', scheduleController.update);
router.delete('/:id', scheduleController.remove);

export default router;