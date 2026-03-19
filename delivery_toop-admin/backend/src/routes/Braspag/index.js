const router = require("express").Router();
const BraspagController = require('../../controllers/Shopping/Braspag');

// BRASPAG
router.get('/transactions', BraspagController.getTransactions);
router.get('/transaction/:paymentId/:merchantId', BraspagController.getTransaction);
router.get('/receive', BraspagController.receive);

// Notification
router.post('/notification', BraspagController.notification);

// Capture
router.post('/capture', BraspagController.capture);


module.exports = router;
