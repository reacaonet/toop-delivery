const router = require("express").Router();

const checkFranchises = require("../../middleware/checkFranchises");
const costCenterController = require("../../controllers/Finance/CostCenter");

router.get("/paginator", checkFranchises, costCenterController.method.paginator);
router.get("/", checkFranchises, costCenterController.method.list);
router.post("/", checkFranchises, costCenterController.method.create);
router.delete("/:id", checkFranchises, costCenterController.method.remove);
router.put("/:id", checkFranchises, costCenterController.method.update);

module.exports = router;
