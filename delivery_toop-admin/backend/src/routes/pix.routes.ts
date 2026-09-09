import { Router } from 'express';
import pixController from '../controllers/pix.controller';

const router = Router();

router.post('/generate-charge', pixController.generateCharge);
router.get('/verify/:txid', pixController.verify);

export default router;