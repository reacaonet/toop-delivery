const router = require('express').Router();

const packingController = require('../controllers/Packing');

router.get('/paginator', packingController.method.paginator);

router.get('/listPorNome', packingController.method.listPorNome);

router.get('/', packingController.method.list);
router.post('/', packingController.method.create);
router.put('/:id', packingController.method.update);
router.delete('/:id', packingController.method.remove);

module.exports = router;
