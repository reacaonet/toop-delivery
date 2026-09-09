import { Router } from 'express';
import shoppingCartController from '../controllers/shopping-cart.controller';

const router = Router();

router.get('/', shoppingCartController.list);
router.get('/reorder/:cart', shoppingCartController.reorder);
router.get('/current', shoppingCartController.current);
router.get('/:cart', shoppingCartController.getById);

router.post('/checkout/:cart', shoppingCartController.checkout);
router.post('/', shoppingCartController.create);
router.post('/:cart', shoppingCartController.addItem);

router.put('/:cart', shoppingCartController.update);
router.put('/item/:item', shoppingCartController.updateItem);

router.delete('/item/:item', shoppingCartController.removeItem);
router.delete('/:cart', shoppingCartController.remove);

export default router;