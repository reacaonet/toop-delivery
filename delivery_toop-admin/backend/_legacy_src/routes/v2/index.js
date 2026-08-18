const router = require("express").Router();

/** middleware */
const checkFranchises = require("../../middleware/checkFranchises");
const auth = require("../../middleware/token");

const FoodRouter = require("./Food");
const PaymentRoute = require("./Payment");
const FinanceRoute = require("./Finance");
const NotificationTopic = require("./Notificaton");
const Accessories = require("./Accessories");
const AlertProduct = require("./AlertProduct");
const Report = require("./Report");
const EcbrImageBank = require("./EcbrBackImage");
const Company = require("./Company");
const LooseDelivery = require("./LooseDelivery");
const Address = require("./Address/address.route");
const Pix = require("./PIX");
const Setting = require("./Setting");
const upload = require("./upload");

router.use("/accessories", auth, Accessories);
router.use("/company", auth, Company);
router.use("/customer-alert-product", auth, checkFranchises, AlertProduct);
router.use("/ecbr-image-bank", auth, EcbrImageBank);
router.use("/finance", auth, FinanceRoute);
router.use("/food", auth, FoodRouter);
router.use("/notification-topic", auth, NotificationTopic);
router.use("/payment", auth, PaymentRoute);
router.use("/report", auth, Report);
router.use("/loose-delivery", auth, LooseDelivery);
router.use("/address", Address);
router.use("/pix", Pix);
router.use("/setting", Setting);
router.use("/upload", upload);

module.exports = router;
