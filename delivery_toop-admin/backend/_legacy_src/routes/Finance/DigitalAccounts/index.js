const router = require("express").Router();

const checkFranchises = require("../../../middleware/checkFranchises");
const ExtractController = require("../../../controllers/Finance/DigitalAccounts/Extract");

/** Routes */
const Account = require("./Account");
const Agency = require("./Agency");
const Bank = require("./Bank");
const Balance = require("./Balance");

router.get("/extract/paginator", checkFranchises, ExtractController.method.paginator);
router.get("/extract/balance", checkFranchises, ExtractController.method.balance);

router.use("/accounts", Account);
router.use("/agencies", Agency);
router.use("/banks", Bank);
router.use("/balances", Balance);

module.exports = router;
