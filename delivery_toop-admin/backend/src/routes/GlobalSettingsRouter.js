const router = require('express').Router();

const GlobalSettings = require('../controllers/GlobalSettings');

router.get('', GlobalSettings.method.list);
module.exports = router;
