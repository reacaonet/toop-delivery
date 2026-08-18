const router = require("express").Router();

const GetBraziliansBank = require('../../../controllers/v2/Setting/ListBrazilianBanks');

router.get('/brazilian-bank', GetBraziliansBank);

module.exports = router;
