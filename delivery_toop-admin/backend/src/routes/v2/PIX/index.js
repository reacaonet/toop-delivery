const router = require("express").Router();

/** Controllers */
const createCharge = require("../../../controllers/v2/Payment/PaymentMethod/PIX/create");
const veryfyPayment = require("../../../controllers/v2/Payment/PaymentMethod/PIX/verifyPayment");

router.post("/create-charge", createCharge);

router.get("/verify/:cartId", veryfyPayment);

module.exports = router;
