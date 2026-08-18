const router = require("express").Router();

/** middleware */
const s3Spaces = require("../../../middleware/spacesS3");
const checkCompanyMiddleware = require("../../../middleware/checkCompany");

const byCompany = require("../../../controllers/v2/Acessories/ByCompanyController");
const checkFranchises = require("../../../middleware/checkFranchises");

/* Category */
const listarPorNome = require("../../../controllers/v2/Acessories/Category/ListPorNomeController");
const createCategory = require("../../../controllers/v2/Acessories/Category/CreateController");
const updateCategory = require("../../../controllers/v2/Acessories/Category/UpdateController");
const deleteCategory = require("../../../controllers/v2/Acessories/Category/DeleteController");

/** Product */
const productList = require("../../../controllers/v2/Acessories/Product/ListController");
const productOnly = require("../../../controllers/v2/Acessories/Product/onlyController");
const productCreate = require("../../../controllers/v2/Acessories/Product/CreateController");
const productUpdate = require("../../../controllers/v2/Acessories/Product/UpdateController");
const productDelete = require("../../../controllers/v2/Acessories/Product/DeleteController");
const productSortUpdate = require("../../../controllers/v2/Acessories/Product/SortUpdateController");
const productListGroupCategory = require("../../../controllers/v2/Acessories/Product/ListGroupCategoryController");

/** Product Complement */
const productComplementList = require("../../../controllers/v2/Acessories/ProductComplement/ListController");
const productComplementCreate = require("../../../controllers/v2/Acessories/ProductComplement/CreateController");

/** Complement Itens */
const complementItemCreate = require("../../../controllers/v2/Acessories/ProductComplementItem/CreateController");
const complementItemList = require("../../../controllers/v2/Acessories/ProductComplementItem/ListController");
const complementItemUpdate = require("../../../controllers/v2/Acessories/ProductComplementItem/UpdateController");
const complementItemDelete = require("../../../controllers/v2/Acessories/ProductComplementItem/DeleteController");

/* Category */
router.get("/category/by-company", checkFranchises, byCompany);
router.get("/category/list-by-name", checkFranchises, listarPorNome);
router.post("/category", createCategory);
router.put("/category", updateCategory);
router.delete("/category/:id", deleteCategory);

/* Product */
router.get("/product/list-group/", productListGroupCategory);
router.get("/product", productList);
router.get("/product/:id", productOnly);
router.post("/product", s3Spaces, productCreate);
router.put("/product/:id", s3Spaces, productUpdate);
router.put("/product/sort", productSortUpdate);
router.delete("/product/:id", checkFranchises, productDelete);

/** Product Complement */
router.get("/product-complement/:productId", productComplementList);
router.post("/product-complement", productComplementCreate);

/** Complements Itens */
router.get("/product-complement-item/", complementItemList);
router.put("/product-complement-item/:id", complementItemUpdate);
router.delete("/product-complement-item/:id", complementItemDelete);
router.post("/product-complement-item/", complementItemCreate);

module.exports = router;
