const router = require("express").Router();

/** Routes */
const Campaign = require("./Campaign");
const cashCustomerList = require("../../controllers/Cashback/Customer/ListController");
const cashMouthTotal = require("../../controllers/Cashback/Customer/totalCustomer");
const byMonthCustomer = require("../../controllers/Cashback/Customer/byMonthCustomer");
const balanceCustomer = require("../../controllers/Cashback/Customer/totalCustomer");
const cashPaginator = require("../../controllers/Cashback/Customer/cashPaginator");
const checkToken = require("../../middleware/token");

router.use("/campaigns", checkToken, Campaign);

router.get("/customer/month/total/:customer", byMonthCustomer);
router.get("/customer/balance/:customer", balanceCustomer);

router.get("/customer/:customer", cashCustomerList);
router.get("/used/paginator", cashPaginator);
module.exports = router;
