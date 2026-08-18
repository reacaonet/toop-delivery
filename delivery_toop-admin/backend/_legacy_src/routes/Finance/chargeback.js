const router = require("express").Router();

const chargeback = require("../../controllers/Finance/chargeback");

router.post("/chargeback", chargeback.paymentChargeback);

module.exports = router;
