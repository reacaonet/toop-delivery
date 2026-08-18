const router = require('express').Router();
const searchUserController = require('../controllers/SearchUser/index');
const checkToken = require('../middleware/token');

// router.get('/', checkToken, userController.method.list);
router.post('/creater', searchUserController.method.creater);


module.exports = router
