const router = require("express").Router();

const categoryController = require("../../controllers/Food/Category");
const checkCompanyMiddleware = require("../../middleware/checkCompany");
const checkFranchises = require("../../middleware/checkFranchises");

router.get("/list-by-name", categoryController.method.listPorNome);
router.get("/by-company", checkFranchises, categoryController.method.bycompany);
router.get("/:companyId?", categoryController.method.list);
router.put("/:id", categoryController.method.update);
router.delete("/:id", checkCompanyMiddleware, categoryController.method.remove);
router.post("/", checkFranchises, categoryController.method.create);

module.exports = router;
