const router = require('express').Router();
const typePaymentsController = require('../../../controllers/Finance/TypePayments');

router.get('/:companyDeliveryId', typePaymentsController.method.listForCompanyDeliveryController);

module.exports = router;
