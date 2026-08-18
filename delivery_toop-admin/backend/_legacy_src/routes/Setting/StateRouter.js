const router = require('express').Router();

const stateController = require('../../controllers/Setting/State');

router.get('/listPorNome', stateController.method.listPorNome);
router.get('/:id?', stateController.method.list);
router.post('/', stateController.method.create);
router.put('/:id', stateController.method.update);
router.delete('/:id', stateController.method.remove);

module.exports = router;