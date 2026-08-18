const router = require('express').Router();

const s3Spaces = require('../middleware/spacesS3');
const tabloidController = require('../controllers/Tabloid');

router.get('/list', tabloidController.method.list);
//router.post('/create', tabloidController.method.create);
router.post('/register', tabloidController.method.register);
//router.put('/update/:id', tabloidController.method.update);
router.delete('/delete/:id', tabloidController.method.remove);

router.post('/create', s3Spaces, tabloidController.method.create);
router.put('/update/:id', s3Spaces, tabloidController.method.update);

module.exports = router;