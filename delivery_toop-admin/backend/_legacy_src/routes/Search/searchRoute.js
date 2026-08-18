const router = require('express').Router();
const Search = require('../../controllers/Search/v1');

router.get('/company-products', Search.method.list);
router.get('/segment/company-products', Search.method.listForSegments);

module.exports = router;
