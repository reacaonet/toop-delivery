import { Router } from 'express';
import offerController from '../controllers/offer.controller';

const router = Router();

router.get('/list', offerController.list);
router.post('/register', offerController.register);
router.post('/create', offerController.create);
router.put('/update/:id', offerController.update);
router.delete('/delete/:id', offerController.remove);

export default router;