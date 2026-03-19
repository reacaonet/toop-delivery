const router = require('express').Router();

/** Controllers */
const afterSplit = require('../../../controllers/v2/finance/splitBraspag/afterSplit');

router.post('/after/braspag/:PaymentId', afterSplit);
module.exports = router;
