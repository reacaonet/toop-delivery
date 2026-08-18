const router = require("express").Router();

/** Middleware  */
const auth = require("../../../middleware/token");

/** controllers */
const Direction = require("../../../controllers/Mobility/maps/DirectionController");
const Matrix = require("../../../controllers/Mobility/maps/MatrixController");
const GeoCode = require("../../../controllers/Mobility/maps/GeoCodeController");
const AutoComplete = require("../../../controllers/Mobility/maps/AutoCompleteController");

router.post("/direction", auth, Direction);
router.post("/matrix", auth, Matrix);
router.post("/geo", auth, GeoCode);
router.post("/complete", auth, AutoComplete);

module.exports = router;
