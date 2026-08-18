const router = require('express').Router();

/** Controllers */
const List = require('../../../controllers/Mobility/chosenDestinations/listController');
const Create = require('../../../controllers/Mobility/chosenDestinations/createController');
const Update = require('../../../controllers/Mobility/chosenDestinations/updateController');
const Remove = require('../../../controllers/Mobility/chosenDestinations/removeController');

router.get('/', List);
router.post('/', Create);
router.put('/:driver/:id', Update);
router.delete('/:driver/:id', Remove);

module.exports = router;
