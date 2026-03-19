const router = require("express").Router();

/** middleware */
const s3Spaces = require("../../../middleware/spacesS3");
const auth = require("../../../middleware/token");
const checkFranchises = require("../../../middleware/checkFranchises");

/** middleware validation */
const DriverValidate = require("../../../validator/mobility/driver/driverCreate.validate");
const FavoriteValidate = require("../../../validator/mobility/driver/favorite.validate");

/** Controllers */
const Create = require("../../../controllers/Mobility/driver/CreateController");
const UpdateLocation = require("../../../controllers/Mobility/driver/UpdateLocationController");
const AvailableReceiveRaceController = require("../../../controllers/Mobility/driver/AvailableReceiveRaceController");
const acceptRaceController = require("../../../controllers/Mobility/driver/AcceptRaceController");
const ActiveRun = require("../../../controllers/Mobility/driver/ActiveRunController");
const Online = require("../../../controllers/Mobility/driver/OnlineController");
const ListStatus = require("../../../controllers/Mobility/driver/ListStatusController");
const ListPorNome = require("../../../controllers/Mobility/driver/ListPorNomeController");
const LocationBackground = require("../../../controllers/Mobility/driver/locationBackground");
const ListLocationCurrent = require("../../../controllers/Mobility/driver/listLocationCurrent");
const Favorite = require("../../../controllers/Mobility/favoriteDriver/favoriteController");
const IsFavorite = require("../../../controllers/Mobility/favoriteDriver/isFavoriteController");
const NearbyDrivers = require("../../../controllers/Mobility/driver/NearbyDriversController");
const LastPosition = require("../../../controllers/Mobility/driver/LastPositionsController");

router.get("/active-run/:driverId", ActiveRun);
router.get("/status", auth, checkFranchises, ListStatus);
router.get("/list-by-name", ListPorNome);
router.get("/location/current/:driver", ListLocationCurrent);
router.get("/favorite/driver/:driver/passenger/:passenger", IsFavorite);
router.get("/lastposition/:driver", LastPosition);
router.post("/", DriverValidate, s3Spaces, Create);
router.post("/available-receive-race", AvailableReceiveRaceController);
router.post("/accept-race", acceptRaceController);
router.post("/favorite", FavoriteValidate, Favorite);
router.post("/background/:driverId", LocationBackground);
router.post("/nearby-drivers", NearbyDrivers);
router.put("/online/:driverId", Online);
router.put("/:driver", UpdateLocation);

module.exports = router;
