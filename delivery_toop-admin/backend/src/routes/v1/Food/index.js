const router = require('express').Router();

/** Routes */
const CategoryRoute = require('./CategoryRouter')
const ProductComplementRoute = require('./ProductComplementRouter')
const DiscountRoute = require('./DiscountRoute');

// Cart
router.use('/category', CategoryRoute);
router.use('/product-complement', ProductComplementRoute);

// Discount
router.use('/discount-restaurant', DiscountRoute);

module.exports = router;
