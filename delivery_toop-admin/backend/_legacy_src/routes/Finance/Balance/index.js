const router = require("express").Router();

const checkFranchises = require("../../../middleware/checkFranchises");
const BalanceController = require("../../../controllers/Finance/Balance");

const DeliveriesPaginator = require("../../../controllers/Finance/Deliveries/DeliverieController");

/** Routes */

router.get("/paginator", checkFranchises, BalanceController.method.paginator);
router.get("/list", checkFranchises, BalanceController.method.list);

router.get("/franchise/paginator", checkFranchises, BalanceController.method.franchisePaginator);
router.get("/franchise/balance", checkFranchises, BalanceController.method.balanceFranchise);

router.get("/company/paginator", checkFranchises, BalanceController.method.companyPaginator);
router.get("/company/balance", checkFranchises, BalanceController.method.balanceCompany);

router.get("/adm/paginator", checkFranchises, BalanceController.method.admPaginator);
router.get("/adm/balance", checkFranchises, BalanceController.method.balanceAdm);
router.post("/adm/balance/check-franchise", BalanceController.method.checkPayment);

router.get("/deliveries/paginator", checkFranchises, DeliveriesPaginator);

module.exports = router;
