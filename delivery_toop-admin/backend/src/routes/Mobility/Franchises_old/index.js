const router = require('express').Router();

const s3Spaces = require('../../../middleware/spacesS3');
const franchiseController = require('../../../controllers/Franchise');

router.get('/listAll', franchiseController.method.listAll);
router.get('/graphic', franchiseController.method.graphList);
router.get('/paginator', franchiseController.method.paginator);
router.get('/search', franchiseController.method.search);

router.get('/list/:id?', franchiseController.method.list);
router.get('/:id?', franchiseController.method.list);
router.post('/', s3Spaces, franchiseController.method.create);
router.put('/:id', s3Spaces, franchiseController.method.update);
router.delete('/:id', franchiseController.method.remove);

module.exports = router;
