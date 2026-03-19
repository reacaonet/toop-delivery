const router = require("express").Router();

/** controllers */
const ListController = require("../../../controllers/Mobility/indication/ListController");

router.get("/", ListController);

module.exports = router;
