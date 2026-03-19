const router = require("express").Router();

const StateRoute = require("./StateRouter");
const CityRoute = require("./CityRouter");
const ControllerRoute = require("./ControllerRouter");
const ModuleRoute = require("./ModuleRouter");
const TypesUsersRoute = require("./TypesUsersRouter");
const AppVersionRoute = require("./AppVersionRouter");
const TimeZoneRoute = require("./TimeZoneRoute");

/** Controllers */
const AppController = require("../../controllers/Setting/App/list");
const Countries = require("../../controllers/Setting/App/CountriesController");

router.use("/state", StateRoute);
router.use("/city", CityRoute);
router.use("/controller", ControllerRoute);
router.use("/module", ModuleRoute);
router.use("/types-users", TypesUsersRoute);
router.use("/app-versions", AppVersionRoute);
router.use("/timezone", TimeZoneRoute);
router.get("/app/:franchise", AppController);
router.get("/countries", Countries);

module.exports = router;
