const router = require("express").Router();

const appVersionController = require("../../controllers/Setting/AppVersion");

router.get("/check", appVersionController.method.check);
router.get("/", appVersionController.method.list);
router.post("/", appVersionController.method.create);

module.exports = router;
