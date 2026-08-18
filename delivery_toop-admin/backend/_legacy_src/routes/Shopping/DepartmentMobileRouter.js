const router = require('express').Router();
const  Department = require('../../controllers/Shopping/DepartmentMobile');

router.get('/paginator', Department.method.paginator);

router.get('/', Department.method.list);
router.post('/', Department.method.create);
router.put('/:id', Department.method.update);
router.delete('/:id', Department.method.remove);

module.exports = router;
