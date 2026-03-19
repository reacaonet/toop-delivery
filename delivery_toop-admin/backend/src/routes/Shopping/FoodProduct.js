const router = require('express').Router();

const itemController = require('../../controllers/Shopping/Cart/food');

// Item cart
router.get('/:foodId', itemController.method.list);

module.exports = router;
