const router = require('express').Router();
const DiscountController = require('../../../controllers/v1/Food/Discount/DiscountController');

router.get('/', DiscountController);

module.exports = router;
