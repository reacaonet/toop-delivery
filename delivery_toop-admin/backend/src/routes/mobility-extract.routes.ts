import { Router } from 'express';
import mobilityExtractController from '../controllers/mobility-extract.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/:driver', authenticate, mobilityExtractController.driverBalance);

export default router;
