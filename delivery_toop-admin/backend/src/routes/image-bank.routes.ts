import { Router } from 'express';
import imageBankController from '../controllers/image-bank.controller';

const router = Router();

router.get('/list/:barcode/:pageIn/:size', imageBankController.list);
router.get('/listPorNome/:nome/:pageIn/:size', imageBankController.listPorNome);
router.get('/listPorCategory/:category/:pageIn/:size', imageBankController.listPorCategory);
router.post('/create', imageBankController.create);
router.post('/register', imageBankController.register);
router.put('/update/:id', imageBankController.update);
router.delete('/delete/:id', imageBankController.remove);

export default router;
