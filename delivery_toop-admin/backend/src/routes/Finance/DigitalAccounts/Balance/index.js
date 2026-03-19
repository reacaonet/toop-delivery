const router = require("express").Router();

const BalanceController = require("../../../../controllers/Finance/DigitalAccounts/Balance");
const checkFranchises = require("../../../../middleware/checkFranchises");

router.post("/", checkFranchises, BalanceController.method.create);

module.exports = router;
