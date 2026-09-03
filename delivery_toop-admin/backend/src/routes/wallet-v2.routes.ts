import { Router } from 'express';
import voucherController from '../controllers/voucher.controller';
import passengerWalletController from '../controllers/passenger-wallet.controller';

const router = Router();

router.get('/balance', passengerWalletController.getBalance);
router.post('/add-balance-voucher', voucherController.validate);

export default router;
