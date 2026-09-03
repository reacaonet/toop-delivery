import { Router } from 'express';
import addressController from '../controllers/address.controller';

const router = Router();

router.get('/state', addressController.listState);
router.get('/city', addressController.listCity);

export default router;
