import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import mobilityServiceRoutes from './mobility-service.routes';
import passengerRoutes from './passenger.routes';

const router = Router();

router.use('/services', authenticate, mobilityServiceRoutes);
router.use('/passengers', authenticate, passengerRoutes);

export default router;
