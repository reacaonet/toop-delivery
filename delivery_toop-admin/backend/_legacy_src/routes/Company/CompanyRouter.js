const router = require("express").Router();

const s3Spaces = require("../middleware/spacesS3");
const companyController = require("../controllers/Company");
const CompanyDeliveryRoute = require("./CompanyDeliveryRouter");
const checkFranchises = require("../../middleware/checkFranchises");

router.get(
  "/favorites/",
  checkFranchises,
  companyController.method.listFavoriteCompanies
);
router.get("/list/:id?", checkFranchises, companyController.method.list);
router.get("/:id?", checkFranchises, companyController.method.list);
router.post("/register", companyController.method.register);
router.delete("/delete/:id", companyController.method.remove);
router.post("/create", s3Spaces, companyController.method.create);
router.put("/update/:id", s3Spaces, companyController.method.update);

// Dados para delivery
router.use("/company-delivery", checkFranchises, CompanyDeliveryRoute);

module.exports = router;
