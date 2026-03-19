const router = require('express').Router();

const paymentMethodController = require('../../controllers/Shopping/PaymentMethod');

router.get('/:customer', paymentMethodController.method.list);
router.post('/:customer', paymentMethodController.method.create);
router.put('/:id', paymentMethodController.method.update);
router.delete('/:id', paymentMethodController.method.remove);

module.exports = router;
