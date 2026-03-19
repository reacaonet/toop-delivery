const router = require("express").Router();

/** Controllers */
const ListController = require("../../../controllers/Mobility/typePaymentService/listTypePaymentController");

router.get("/", ListController);

module.exports = router;
