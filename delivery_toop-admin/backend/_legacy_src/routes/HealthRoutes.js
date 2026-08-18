const router = require('express').Router();
const HealthController = require('../controllers/Health')

/**
 * @swagger
 * /health:
 *  get:
 *    description: Use to know the status of the API
 *    responses:
 *      200:
 *        description: A successful response
 *      400:
 *        description: A errorful response
 */
router.get('/', HealthController.check);

module.exports = router;