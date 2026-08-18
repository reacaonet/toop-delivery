const router = require("express").Router();

const OrderRoute = require("./order/orderRoutes");
const chatRoute = require("./chatRoute");

const auth = require("../../../middleware/token");

router.use("/order", auth, OrderRoute);
router.use("/chat", auth, chatRoute);
module.exports = router;
