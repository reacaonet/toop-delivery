const router = require("express").Router();

const couponCompanyController = require("../controllers/CouponCompany");

router.post("/create", couponCompanyController.method.create);
router.put("/update/:id", couponCompanyController.method.update);
router.get("/list/:id?", couponCompanyController.method.list);
router.get("/company", couponCompanyController.method.company);
router.get("/search", couponCompanyController.method.searchCoupon);
router.delete("/delete/:id", couponCompanyController.method.remove);

module.exports = router;
