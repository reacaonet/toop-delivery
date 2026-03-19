const router = require('express').Router();
const AuthController = require('../controllers/Auth')

router.post('/', AuthController.method.auth)
router.post('/refresh', AuthController.method.refresh)

module.exports = router;