const router = require('express').Router();

const subordinateController = require('../../controllers/Finance/Subordinates');

router.get('/', subordinateController.method.list);
router.post('/', subordinateController.method.create);
router.delete('/:id', subordinateController.method.remove);
router.put('/:id', subordinateController.method.update);

module.exports = router;