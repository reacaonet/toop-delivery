const router = require('express').Router();
const  ListController = require('../../controllers/Shopping/Invoice/ListController');
const  DetailController = require('../../controllers/Shopping/Invoice/DetailController');

router.get('/', ListController);
router.get('/:id', DetailController);


module.exports = router;
