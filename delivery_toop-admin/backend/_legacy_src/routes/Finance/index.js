const router = require("express").Router();

/** Routes */
const TypePayments = require("./TypePayments");
const Subordinate = require("./Subordinate");
const DigitalAccounts = require("./DigitalAccounts");
const CostCenter = require("./CostCenter");

const Balance = require("./Balance");
const Chargeback = require("./chargeback");

router.use("/type-payments", TypePayments);
router.use("/subordinates", Subordinate);
router.use("/digital-accounts", DigitalAccounts);
router.use("/cost-centers", CostCenter);
router.use("/balances", Balance);
router.use(Chargeback);

module.exports = router;
