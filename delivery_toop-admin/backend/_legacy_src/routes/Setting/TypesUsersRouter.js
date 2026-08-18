const router = require('express').Router();

const typesUsersController = require('../../controllers/Setting/TypesUsers');

router.get('/paginator', typesUsersController.method.paginator);
router.get('/', typesUsersController.method.list);
router.post('/', typesUsersController.method.create);
router.put('/:id', typesUsersController.method.update);
router.delete('/:id', typesUsersController.method.remove);

module.exports = router;