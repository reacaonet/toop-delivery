const chatImageS3 = require('../../middleware/chatImageS3');
const router = require('express').Router();
const ChatMessage = require('../../controllers/Chat/Message')

/**
 * @swagger
 * /chat:
 *   get:
 *     description: Use to return the entire list of Chat
 *     tags: [Chat]
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A successful response
 *       400:
 *        description: A errorful response
 */
router.get('/', ChatMessage.method.list)

/**
 * @swagger
 * /chat/message/total/no-read/:cartId:
 *   get:
 *     description: Use to return total unviewed chats
 *     tags: [Chat]
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A successful response
 *       400:
 *        description: A errorful response
 */
router.get('/message/total/no-read/:cartId', ChatMessage.method.noRead)

/**
 * @swagger
 * /chat:
 *   post:
 *     description: Use to return a chat's registration
 *     tags: [Chat]
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A successful response
 *       400:
 *        description: A errorful response
 */
router.post('/', ChatMessage.method.register)

/**
 * @swagger
 * /chat/image:
 *   post:
 *     description: Use to return a chat image's registration
 *     tags: [Chat]
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A successful response
 *       400:
 *        description: A errorful response
 */
router.post('/image', chatImageS3, ChatMessage.method.registerImage)

/**
 * @swagger
 * /chat/read:
 *   put:
 *     description: Use to return a update read
 *     tags: [Chat]
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A successful response
 *       400:
 *        description: A errorful response
 */
router.put('/read', ChatMessage.method.updateRead);
module.exports = router
