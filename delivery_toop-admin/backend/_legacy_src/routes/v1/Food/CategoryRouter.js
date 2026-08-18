const router = require('express').Router();

const categoryController = require('../../../controllers/v1/Food/Category');

router.get('/:company', categoryController.method.list);
router.put('/:id', categoryController.method.update);
router.delete('/:id', categoryController.method.remove);
router.post('/:company', categoryController.method.create);

module.exports = router;