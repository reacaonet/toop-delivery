const router = require("express").Router();

/** middleware */
const auth = require("../../../middleware/token");
const checkFranchises = require("../../../middleware/checkFranchises");

/** Controllers */
const PassengerController = require("../../../controllers/Mobility/Passenger");
const ActiveRun = require("../../../controllers/Mobility/Passenger/ActiveRunController");
const filterPassenger = require("../../../controllers/Mobility/Passenger/FilterPassenger");

router.get("/active-run/:passenger", ActiveRun);
router.get("/listAll", PassengerController.method.listAll);
router.get("/graphic", PassengerController.method.graphList);
router.get("/paginator", auth, checkFranchises, PassengerController.method.paginator);
router.get("/search", PassengerController.method.search);
router.get("/filter", auth, checkFranchises, filterPassenger);

router.get("/list/:id?", PassengerController.method.list);
router.get("/:id?", PassengerController.method.list);
router.post("/link-frachise", auth, PassengerController.method.linkToFranchise);
router.post("/", PassengerController.method.create);
router.put("/:id", PassengerController.method.update);
router.delete("/:id", PassengerController.method.remove);

module.exports = router;
