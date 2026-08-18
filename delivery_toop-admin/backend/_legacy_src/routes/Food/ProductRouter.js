const router = require('express').Router();

const checkCompanyMiddleware = require('../../middleware/checkCompany');

const s3Spaces = require('../../middleware/spacesS3');
const productController = require('../../controllers/Food/Product');

router.get('/list-by-name', productController.method.listByName);
router.get('/', productController.method.list);
router.get('/:id', productController.method.only);
router.put('/sort', productController.method.sortUpdate);
router.put('/:id', s3Spaces, productController.method.update);
router.put('/:id/status', productController.method.statusUpdate);
router.delete('/:id', checkCompanyMiddleware,  productController.method.remove);
router.post('/', s3Spaces, productController.method.create);

module.exports = router;
