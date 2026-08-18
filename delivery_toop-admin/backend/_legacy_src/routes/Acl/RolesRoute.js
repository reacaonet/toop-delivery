const router = require('express').Router();

const AclController = require('../../controllers/Acl/roles');

const aclController = require('../../controllers/Acl');

router.get('/paginator', AclController.method.paginator);

router.get('/listPorNome', AclController.method.listPorNome);

router.get('/', AclController.method.list);
router.get('/', aclController.method.roles);
router.post('/', AclController.method.create);
router.put('/:id', AclController.method.update);
router.delete('/:id', AclController.method.remove);

module.exports = router;
