const router = require('express').Router();

/** Routes */
const CampaignRoute = require('./CampaignRouter')

// Campaingn
router.use('/campaign', CampaignRoute);

module.exports = router;