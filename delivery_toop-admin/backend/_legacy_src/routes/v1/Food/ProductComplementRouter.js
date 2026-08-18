const router = require('express').Router();

const productComplementController = require('../../../controllers/v1/Food/ProductComplement');

router.get('/:productId', productComplementController.method.list);

module.exports = router;
