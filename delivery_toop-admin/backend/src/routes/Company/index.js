const router = require("express").Router();

const s3Spaces = require("../../middleware/spacesS3");
const checkFranchises = require("../../middleware/checkFranchises");
const companyController = require("../../controllers/Company");
const CompanyDeliveryRoute = require("./CompanyDeliveryRouter");
const CompanyScheduleRoute = require("./CompanyScheduleRouter");
const segmentRoute = require("./SegmentRouter");
const siteRoute = require("./SiteRouter");
const priceDelivery = require("../../controllers/Company/Delivery/PriceDelivery");

// Dados para delivery
router.use("/company-delivery", checkFranchises, CompanyDeliveryRoute);
router.use("/schedule", CompanyScheduleRoute);
router.use("/segment", segmentRoute);
router.use("/site", siteRoute);

router.get("/listAll", checkFranchises, companyController.method.listAll);
router.get("/graphic", checkFranchises, companyController.method.graphList);
router.get("/paginator", checkFranchises, companyController.method.paginator);
router.get("/search", checkFranchises, companyController.method.search);
router.get("/favorites", checkFranchises, companyController.method.listFavoriteCompanies);
router.get("/highlights", companyController.method.listHighlighted);
router.get("/list/:id?", checkFranchises, companyController.method.list);
router.get("/price-delivery/:company", priceDelivery);
router.get("/:id?", checkFranchises, companyController.method.list);
router.post("/register", companyController.method.register);
router.post("/", s3Spaces, companyController.method.create);
router.put("/:id", s3Spaces, companyController.method.update);
router.delete("/:id", companyController.method.remove);

router.post("/hours", companyController.method.hoursCreate);
router.get("/hours/:idCompany", checkFranchises, companyController.method.hoursShow);
router.delete("/hours/:id", companyController.method.hoursDelete);
router.put("/hours/:id", companyController.method.hoursUpdate);

module.exports = router;
