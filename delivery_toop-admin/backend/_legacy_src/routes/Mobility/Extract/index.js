const router = require("express").Router();

/** controllers */
const DriverBalance = require("../../../controllers/Mobility/extract/DriverBalanceController");

router.get("/:driver", DriverBalance);

module.exports = router;
