const router = require('express').Router();
const SynchronizeProducts = require('../../controllers/SynchronizeProducts');

router.post('/', SynchronizeProducts.method.sync);

module.exports = router;
