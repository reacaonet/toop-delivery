const router = require('express').Router();

/** Routes */
const checkFranchises = require("../../middleware/checkFranchises");
const CategoryRoute = require('./CategoryRouter')
const ProductRoute = require('./ProductRouter')
const ProductComplementRoute = require('./ProductComplementRouter')
const ProductComplementItemRoute = require('./ProductComplementItemRouter')

// Cart
router.use('/category', checkFranchises, CategoryRoute);
router.use('/product', ProductRoute);
router.use('/product-complement', ProductComplementRoute);
router.use('/product-complement-item', ProductComplementItemRoute);

module.exports = router;
