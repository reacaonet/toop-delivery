const router = require("express").Router();
const AppInfoController = require("../../../controllers/v2/Report/App/ListController");
const CustomerNewRegistration = require("../../../controllers/v2/Report/Customer/NewRegistration");
const cartSalesMade = require("../../../controllers/v2/Report/Shopping/CartSalesMade");
const cartSalesMadeMobile = require("../../../controllers/v2/Report/ShoppingMobile/cartSalesMadeMobile")
const DeliveryManRaces = require("../../../controllers/v2/Report/DeliveryMan/Races/ListController");

const checkFranchises = require("../../../middleware/checkFranchises");

router.get(
  "/app-info/installation-and-uninstall",
  checkFranchises,
  AppInfoController
);
router.get(
  "/customer/new-registration",
  checkFranchises,
  CustomerNewRegistration
);
router.get(
  "/shopping/carts-created-sales-made",
  checkFranchises,
  cartSalesMade
);

router.get(
  "/mobile/shopping/carts-created-sales-made/:company_id",
  cartSalesMadeMobile
);


/* deliveryman racing reporting route */
router.get("/deliveryman/races/:deliveryman_id?", DeliveryManRaces);

module.exports = router;
