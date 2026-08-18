const router = require("express").Router();

const acessController = require("../controllers/AcessFlow");

const checkFranchises = require("../middleware/checkFranchises");

router.post("/create", acessController.method.create);
router.get("/list", checkFranchises, acessController.method.list);
router.get("/statistic", checkFranchises, acessController.method.statistic);

module.exports = router;
