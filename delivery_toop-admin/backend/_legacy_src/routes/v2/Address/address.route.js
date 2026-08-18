const router = require("express").Router();

/** Controllers */
const ListState = require('../../../controllers/v2/Address/state')
const ListCity = require('../../../controllers/v2/Address/city')


router.get('/state', ListState);
router.get('/city', ListCity);


module.exports = router;
