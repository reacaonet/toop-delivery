const router = require('express').Router();

const s3Spaces = require('../../middleware/spacesS3');
const CategoryApp = require('../../controllers/Aplicativos/Category');

const checkFranchises = require("../../middleware/checkFranchises");

router.get('/paginator', checkFranchises, CategoryApp.method.paginator);

router.get('/', CategoryApp.method.list);
// router.post('/', CategoryApp.method.create);
// router.put('/:id', CategoryApp.method.update);
router.delete('/:id', CategoryApp.method.remove);

router.post('/', s3Spaces, CategoryApp.method.create);
router.put('/:id', s3Spaces, CategoryApp.method.update);

module.exports = router;
