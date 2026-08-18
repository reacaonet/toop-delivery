const router = require('express').Router();

const productComplementItemController = require('../../controllers/Food/ProductComplementItem');

router.get('/', productComplementItemController.method.list);
router.put('/:id', productComplementItemController.method.update);
router.delete('/:id', productComplementItemController.method.remove);
router.post('/', productComplementItemController.method.create);

module.exports = router;
