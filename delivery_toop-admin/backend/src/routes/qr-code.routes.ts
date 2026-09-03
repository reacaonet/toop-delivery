import { Router } from 'express';
import qrCodeController from '../controllers/qr-code.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/generate-driver', authenticate, qrCodeController.generateDriver);
router.get('/list-driver-code', authenticate, qrCodeController.listDriverCode);

export default router;
