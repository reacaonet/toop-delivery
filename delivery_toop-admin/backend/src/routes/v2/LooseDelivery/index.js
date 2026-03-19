const router = require("express").Router();

const LooseCreate = require('../../../controllers/v2/LooseDelivery/create')
const Address = require('../../../controllers/v2/LooseDelivery/address')

router.post('/', LooseCreate);
router.get('/address', Address);

module.exports = router;
