const router = require('express').Router();
const s3Spaces = require('../../middleware/spacesS3');

/** Routes */
const PopupRoute = require('./PopupRouter');
const IntegrationsRoute = require('./IntegrationsRouter');

router.use('/popup', PopupRoute);
router.use('/integrations', IntegrationsRoute);

module.exports = router;
