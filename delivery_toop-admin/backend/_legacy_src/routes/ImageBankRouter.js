const router = require('express').Router();

const s3Spaces = require('../middleware/spacesS3');
const imageBankController = require('../controllers/ImageBank');

router.get('/list/:barcode/:pageIn/:size', imageBankController.method.list);
router.get('/listPorNome/:nome/:pageIn/:size', imageBankController.method.listPorNome);
router.get('/listPorCategory/:category/:pageIn/:size', imageBankController.method.listPorCategory);

//router.post('/create', imageBankController.method.create);
router.post('/register', imageBankController.method.register);
//router.put('/update/:id', imageBankController.method.update);
router.delete('/delete/:id', imageBankController.method.remove);

router.post('/create', s3Spaces, imageBankController.method.create);
router.put('/update/:id', s3Spaces, imageBankController.method.update);

module.exports = router;
