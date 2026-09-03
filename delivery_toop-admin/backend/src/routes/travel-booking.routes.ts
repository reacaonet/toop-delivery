import { Router } from 'express';
import travelBookingController from '../controllers/travel-booking.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/travel-info/:booking', travelBookingController.getByBooking);

export default router;
