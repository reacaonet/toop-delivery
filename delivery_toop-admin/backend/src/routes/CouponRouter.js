const router = require("express").Router();

const couponController = require("../controllers/Coupon");
const checkFranchises = require("../middleware/checkFranchises");

router.get("/paginator", checkFranchises, couponController.method.paginator);
router.get("/search", couponController.method.search);
router.post("/", couponController.method.create);
router.put("/update/:id", couponController.method.update);
router.get("/list/:id?", couponController.method.list);
router.delete("/delete/:id?", couponController.method.remove);
router.get("/display/", couponController.method.display);
router.get("/highCupon/", couponController.method.highCupon);
router.get("/companyCoupons/:id?", couponController.method.companyCoupons);
router.get(
  "/companyCouponsAvailable/:id",
  couponController.method.companyCouponsAvailable
);

router.get(
  "/company-coupons-available/:id",
  couponController.method.companyCouponsAvailable
);

router.get("/couponCustomer", couponController.method.couponCustomer);
router.get(
  "/coupon-customer-paginator",
  couponController.method.couponCustomerPaginator
);

module.exports = router;
