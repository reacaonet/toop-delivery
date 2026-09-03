import { Router } from 'express';
import voucherController from '../controllers/voucher.controller';

const router = Router();

router.post('/', voucherController.create);
router.get('/paginator', voucherController.paginator);
router.put('/:id', voucherController.update);
router.delete('/:id', voucherController.remove);

export default router;
