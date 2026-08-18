const router = require('express').Router();

const productComplementController = require('../../controllers/Food/ProductComplement');

router.get('/cartItem/:cartItem', productComplementController.method.cartItemComplement);
router.get('/:productId', productComplementController.method.list);
router.put('/:id', productComplementController.method.update);
router.delete('/:id', productComplementController.method.remove);
router.post('/', productComplementController.method.create);

module.exports = router;
