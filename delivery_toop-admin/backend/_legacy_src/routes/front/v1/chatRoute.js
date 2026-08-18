const router = require('express').Router();
const ChatController = require('../../../controllers/Front/v1/chat');

router.get('/:cartId', ChatController.method.list);
router.post('', ChatController.method.create);

module.exports = router;
