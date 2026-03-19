const router = require("express").Router();

const syncLegacyController = require("../../controllers/SyncLegacy");

router.get("/:login", syncLegacyController.method.sync);

module.exports = router;
