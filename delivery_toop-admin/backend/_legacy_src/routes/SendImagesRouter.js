const router = require('express').Router();

const sendImagesController = require('../controllers/SendImages');

router.post('/', sendImagesController.method.create);

module.exports = router;
