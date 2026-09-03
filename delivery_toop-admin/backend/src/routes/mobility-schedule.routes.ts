import { Router } from 'express';
import mobilityScheduleController from '../controllers/mobility-schedule.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/scheduled/driver/:driver', mobilityScheduleController.getScheduledByDriver);
router.post('/schedule', mobilityScheduleController.createSchedule);
router.put('/schedule', mobilityScheduleController.updateSchedule);

export default router;
