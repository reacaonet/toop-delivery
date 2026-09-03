import { Router } from 'express';
import ecbrImageBankController from '../controllers/ecbr-image-bank.controller';

const router = Router();

router.get('/', ecbrImageBankController.list);
router.get('/generate/code/ecbr', ecbrImageBankController.generateCode);
router.get('/barcode/:barcode', ecbrImageBankController.listByBarcode);
router.get('/sync', ecbrImageBankController.sync);
router.post('/', ecbrImageBankController.create);
router.put('/update/:id', ecbrImageBankController.update);

export default router;
