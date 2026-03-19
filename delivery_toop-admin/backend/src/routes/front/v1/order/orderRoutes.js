const router = require("express").Router();

const checkCompanyMiddleware = require("../../../../middleware/checkCompany");
const checkFranchises = require("../../../../middleware/checkFranchises");

const List = require("../../../../controllers/Front/v1/Order/ListController");
const ListOne = require("../../../../controllers/Front/v1/Order/ListOneController");
const Search = require("../../../../controllers/Front/v1/Order/SearchController");

router.get("/:orderId", ListOne);
router.get("/", checkFranchises, List);
router.get("/search/params", Search);

module.exports = router;
