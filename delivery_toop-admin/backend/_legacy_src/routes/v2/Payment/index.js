const router = require("express").Router();
const NotOrderStatus = require("../../../controllers/v2/Payment/NotOrderStatus");
const MoneyController = require("../../../controllers/v2/Payment/PaymentMethod/Money/MoneyController");
const PixDirectController = require("../../../controllers/v2/Payment/PaymentMethod/PixDirect/PixDirectController");
const CardMachineController = require("../../../controllers/v2/Payment/PaymentMethod/Card/CardPaymentController");

const checkFranchises = require("../../../middleware/checkFranchises");

router.get("/not-orderstatus", checkFranchises, NotOrderStatus);
router.post("/money/send/cart/:cartId", MoneyController);
router.post("/pix-direct/send/cart/:cartId", PixDirectController);
router.post("/card-machine/send/cart/:cartId", CardMachineController);

module.exports = router;
