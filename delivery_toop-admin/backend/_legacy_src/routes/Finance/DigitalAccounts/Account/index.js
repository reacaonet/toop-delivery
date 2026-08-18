const router = require("express").Router();

const AccountController = require("../../../../controllers/Finance/DigitalAccounts/Account");
const checkFranchises = require("../../../../middleware/checkFranchises");

router.get("/listAll", checkFranchises, AccountController.method.listAll);
router.get("/paginator", checkFranchises, AccountController.method.paginator);

router.get("/search/", checkFranchises, AccountController.method.search);
router.get("/list/:id?", checkFranchises, AccountController.method.list);
router.get("/:id?", checkFranchises, AccountController.method.list);
router.post("/", checkFranchises, AccountController.method.create);
router.put("/:id", checkFranchises, AccountController.method.update);
router.delete("/:id", checkFranchises, AccountController.method.remove);

module.exports = router;
