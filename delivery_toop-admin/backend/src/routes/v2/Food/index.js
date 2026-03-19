const router = require("express").Router();
const GetProductGroupCategory = require('../../../controllers/v2/food/product/ListGroupCategoryController');

router.get('/product', GetProductGroupCategory);

module.exports = router;
