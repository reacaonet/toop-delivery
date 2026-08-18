const router = require("express").Router();

/** middleware */
const auth = require("../../../middleware/token");

/** controllers */
const CreateController = require("../../../controllers/Mobility/favoritePlaces/CreateController");
const ListController = require("../../../controllers/Mobility/favoritePlaces/ListControllers");

router.get("/", auth, ListController);
router.post("/", auth, CreateController);

module.exports = router;
