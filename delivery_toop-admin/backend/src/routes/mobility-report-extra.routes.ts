import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import evaluationRoutes from './mobility-evaluation.routes';
import travelBookingRoutes from './travel-booking.routes';
import scheduleRoutes from './mobility-schedule.routes';
import reportRoutes from './mobility-report.routes';

const router = Router();

router.use('/evaluation', authenticate, evaluationRoutes);
router.use('/booking', authenticate, travelBookingRoutes);
router.use('/booking', authenticate, scheduleRoutes);
router.use('/report', authenticate, reportRoutes);

export default router;
