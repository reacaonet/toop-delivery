const router = require("express").Router();

//middleware check auth
const auth = require("../middleware/token");
const checkFranchises = require("../middleware/checkFranchises");

const customerController = require("../controllers/Customer");
const deliveryAddressController = require("../controllers/Customer/DeliveryAddress");
const GuestController = require("../controllers/Customer/Guest");
const CustomerSearch = require("../controllers/Customer/CustomerSearchController");
const SearchPersonCustomer = require("../controllers/Customer/SearchCustomerController");

router.get("/paginator", auth, checkFranchises, customerController.method.paginator);
router.get("/listPorNome", auth, customerController.method.listPorNome);
router.get("/list", auth, customerController.method.list);
router.get("/list/:id", auth, customerController.method.list);
router.post("/create", auth, customerController.method.create);
router.put("/update/:id", auth, customerController.method.update);
router.delete("/delete/:id", auth, customerController.method.remove);
router.get("/search", customerController.method.search);
router.get("/search-customer", auth, CustomerSearch);
router.get("/search-person-customer", auth, checkFranchises, SearchPersonCustomer);

router.get("/delivery-address/list/:id?", auth, deliveryAddressController.method.list);
router.get("/delivery-address/search", auth, deliveryAddressController.method.search);
// Endereços para entrega Delivery addresss
router.get("/delivery-address/:id", auth, deliveryAddressController.method.find);
router.post("/delivery-address/create", auth, deliveryAddressController.method.create);
router.put("/delivery-address/update/:id", auth, deliveryAddressController.method.update);
router.delete("/delivery-address/delete/:id", auth, deliveryAddressController.method.remove);

// Convidado
router.get("/guest/:device", GuestController.method.listOne);
router.post("/guest", GuestController.method.create);
router.put("/guest", GuestController.method.update);

module.exports = router;
