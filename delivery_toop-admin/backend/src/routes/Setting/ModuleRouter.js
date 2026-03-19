const router = require('express').Router();

const moduleController = require('../../controllers/Setting/Module');

router.get('/paginator', moduleController.method.paginator);
router.get('/listPorNome', moduleController.method.listPorNome);
router.get('/tree', moduleController.method.treemodules);
router.get('/', moduleController.method.list);
router.post('/', moduleController.method.create);
router.put('/:id', moduleController.method.update);
router.delete('/:id', moduleController.method.remove);

module.exports = router;