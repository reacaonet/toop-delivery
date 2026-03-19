const router = require('express').Router();
const acessGroupController = require('../controllers/AcessGroup');

router.get('/', acessGroupController.method.tree);
router.post('/', acessGroupController.method.create);
router.put('/:id', acessGroupController.method.update);
router.delete('/:id', acessGroupController.method.remove);

module.exports = router
