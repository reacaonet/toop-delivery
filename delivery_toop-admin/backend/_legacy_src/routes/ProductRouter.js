const router = require("express").Router();

const checkCompanyMiddleware = require("../middleware/checkCompany");
const checkFranchises = require("../middleware/checkFranchises");
const s3Spaces = require("../middleware/spacesS3");
const productController = require("../controllers/Product");
const sortDepartmentController = require("../controllers/Product/sortDepartmentController");

router.get('/sort-department/:company', sortDepartmentController.listSortDepartment)
router.get('/sort-verify-department/:company', sortDepartmentController.verifyCreateSortDepartment)
router.put('/sort-update-department/:id', sortDepartmentController.updateSortDepartment)
router.get("/paginator", checkFranchises, productController.method.paginator);
router.get("/list-by-name", productController.method.listByName);
router.get("/list/:id?", productController.method.list);
router.get("/search/:id?", checkFranchises, productController.method.search);
// router.post('/create', productController.method.create);
router.post("/register", productController.method.register);
//router.put('/update/:id', productController.method.update);
router.delete("/delete/:id", productController.method.remove);
// Retorna os produtos de um determinado supermercado
router.get("/company/:id", productController.method.filterCompany);
router.get("/department/:id", productController.method.department);
router.get("/company/offer/:id", productController.method.companyOffer);

router.get(
  "/company/:company/barcode/:barcode",
  productController.method.barCode
);

router.get("/related", productController.method.related);

router.post('/link', productController.method.link)

router.post(
  "/create",
  s3Spaces,
  checkCompanyMiddleware,
  productController.method.create
);
router.put(
  "/update/:id",
  s3Spaces,
  checkCompanyMiddleware,
  productController.method.update
);
router.put("/update-image/:id", productController.method.updateImage);

module.exports = router;
