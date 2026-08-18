const router = require('express').Router();

const s3Spaces = require('../middleware/spacesS3');
const offerController = require('../controllers/Offer');

router.get('/list', offerController.method.list);
//router.post('/create', offerController.method.create);
router.post('/register', offerController.method.register);
//router.put('/update/:id', offerController.method.update);
router.delete('/delete/:id', offerController.method.remove);

router.post('/create', s3Spaces, offerController.method.create);
router.put('/update/:id', s3Spaces, offerController.method.update);

module.exports = router;