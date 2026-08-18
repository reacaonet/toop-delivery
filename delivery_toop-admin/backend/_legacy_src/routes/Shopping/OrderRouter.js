const router = require("express").Router();

const OrderStatus = require("../../controllers/Shopping/order/status");
const ownDelivery = require("../../controllers/Shopping/order/OwnDeliveryController");
const onlineDelivery = require("../../controllers/Shopping/order/OnlineDeliveryController");
const costFreight = require("../../controllers/Shopping/order/CostFreightController");

const { deliveryInformation } = require("../../controllers/Shopping/order/DeliveryInformationController");

router.get("/list-cancelled/:company", OrderStatus.method.listCancelledOrder);
router.get("/delivery/id/:id", OrderStatus.method.listOne);
router.get("/delivery/information/:order", deliveryInformation);
router.get("/current-order/:id", OrderStatus.method.currentOrder);
router.get("/delivery/cron/id/:id", OrderStatus.method.listOneCron);
router.get("/payment/:payment", OrderStatus.method.listOrder);
router.get("/delivery/:company", OrderStatus.method.listDelivery);
router.get("/deliveryMan/:customerDelivery", OrderStatus.method.listDeliveryMan);
router.put("/status/:_id", OrderStatus.method.changeStatus);
router.get("/own-delivery/:order", ownDelivery.allowed);
router.get("/online-delivery/:order", onlineDelivery.allowed);
router.get("/cost-freight/:order", costFreight.listFreight);
router.put("/cost-freight/:order", costFreight.updateFreight);
router.get("/customerHaveOrder/:customer", OrderStatus.method.listOrderCustomer);

module.exports = router;
