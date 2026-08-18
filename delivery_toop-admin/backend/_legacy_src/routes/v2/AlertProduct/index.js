const router = require("express").Router();
// const MoneyController = require('../../../controllers/v2/Payment/PaymentMethod/Money/MoneyController');
// const CardMachineController = require('../../../controllers/v2/Payment/PaymentMethod/Card/CardPaymentController');

// router.post('/money/send/cart/:cartId', MoneyController);
// router.post('/card-machine/send/cart/:cartId', CardMachineController)

const ListController = require('../../../controllers/v2/Customer/AlertProduct/ListController');
const ReportController = require('../../../controllers/v2/Customer/AlertProduct/ReportController');
const CreateController = require('../../../controllers/v2/Customer/AlertProduct/CreateController');
const UpdateController = require('../../../controllers/v2/Customer/AlertProduct/UpdateController');


router.get('/alert-product/notification', ListController);
router.get('/alert-product/report', ReportController);

router.post('/alert-product/notification', CreateController);
router.put('/alert-product/notification/:idAlert', UpdateController);

module.exports = router;
