import { Router } from 'express';
import siteContentController from '../controllers/site-content.controller';

const router = Router();

router.get('/list', siteContentController.tipDeliveryManList);
router.post('/create', siteContentController.tipDeliveryManCreate);
router.delete('/delete/:id', siteContentController.tipDeliveryManRemove);

export default router;
