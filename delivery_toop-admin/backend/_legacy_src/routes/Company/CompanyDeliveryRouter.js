const router = require("express").Router();

const companyDeliveryController = require("../../controllers/CompanyDelivery");

const checkCompanyMiddleware = require("../../middleware/checkCompany");
const checkFranchisesMiddleware = require("../../middleware/checkFranchises");

router.get("/paginator", companyDeliveryController.method.paginator);
router.get("/:company?", companyDeliveryController.method.list);
router.post("/:company", checkFranchisesMiddleware, companyDeliveryController.method.create);
router.put("/open-company", checkCompanyMiddleware, companyDeliveryController.method.openCompanyUpdate);
router.put("/:id", checkFranchisesMiddleware, companyDeliveryController.method.update);
router.delete("/:company", companyDeliveryController.method.remove);
router.put("/companyId/:id", companyDeliveryController.method.updateCompanyId);

module.exports = router;
