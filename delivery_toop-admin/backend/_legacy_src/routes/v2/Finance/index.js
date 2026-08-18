const router = require('express').Router();

/** Routes */
const TypePayments = require('./TypePayments')
const SplitBraspag = require('./SplitBraspag');

router.use('/type-payments', TypePayments);
router.use('/split', SplitBraspag);

module.exports = router;
