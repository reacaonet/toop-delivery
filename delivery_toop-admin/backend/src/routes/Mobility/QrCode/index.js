const router = require("express").Router();

/** controllers */
const GenerateCodeDriver = require("../../../controllers/Mobility/QrCode/GenerateCodeDriver");
const ListCodeDriver = require("../../../controllers/Mobility/QrCode/listCodeDriver");

router.get("/generate-driver", GenerateCodeDriver);
router.get("/list-driver-code", ListCodeDriver);

module.exports = router;
