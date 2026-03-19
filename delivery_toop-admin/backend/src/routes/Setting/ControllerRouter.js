const router = require('express').Router();

const controllerController = require('../../controllers/Setting/Controller');

router.get('/paginator', controllerController.method.paginator);

router.get('/', controllerController.method.list);
router.post('/', controllerController.method.create);
router.put('/:id', controllerController.method.update);
router.delete('/:id', controllerController.method.remove);

module.exports = router;