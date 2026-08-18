const router = require('express').Router();

const s3Spaces = require('../../middleware/spacesS3');
const typePaymentsController = require('../../controllers/Finance/TypePayments');

router.get('/paginator', typePaymentsController.method.paginator);
router.get('/:companyDeliveryId', typePaymentsController.method.listForCompanyDeliveryController);
router.get('/', typePaymentsController.method.list);
router.post('/', s3Spaces, typePaymentsController.method.create);
router.delete('/:id', typePaymentsController.method.remove);
router.put('/:id', s3Spaces, typePaymentsController.method.update);

module.exports = router;
