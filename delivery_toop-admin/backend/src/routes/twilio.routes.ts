import { Router } from 'express';
import twilioController from '../controllers/twilio.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, twilioController.create);
router.post('/send-code', twilioController.sendCode);
router.post('/verify-code', twilioController.verifyCode);

export default router;
