const router = require("express").Router();

const BankController = require("../../../../controllers/Finance/DigitalAccounts/Bank");
const checkFranchises = require("../../../../middleware/checkFranchises");

router.get("/listAll", checkFranchises, BankController.method.listAll);

router.get("/list/:id?", checkFranchises, BankController.method.list);
router.get("/:id?", checkFranchises, BankController.method.list);
router.post("/", checkFranchises, BankController.method.create);
router.put("/:id", checkFranchises, BankController.method.update);
router.delete("/:id", checkFranchises, BankController.method.remove);

module.exports = router;
