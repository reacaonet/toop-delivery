const router = require("express").Router();

const AgencyController = require("../../../../controllers/Finance/DigitalAccounts/Agency");
const checkFranchises = require("../../../../middleware/checkFranchises");

router.get("/listAll", checkFranchises, AgencyController.method.listAll);
router.get("/paginator", checkFranchises, AgencyController.method.paginator);

router.get("/list/:id?", checkFranchises, AgencyController.method.list);
router.get("/:id?", checkFranchises, AgencyController.method.list);
router.post("/", checkFranchises, AgencyController.method.create);
router.put("/:id", checkFranchises, AgencyController.method.update);
router.delete("/:id", checkFranchises, AgencyController.method.remove);

module.exports = router;
