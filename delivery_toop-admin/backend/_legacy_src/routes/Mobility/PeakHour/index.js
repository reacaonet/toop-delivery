const router = require("express").Router();

/** middleware */
const auth = require("../../../middleware/token");
const checkFranchises = require("../../../middleware/checkFranchises");
const s3Spaces = require("../../../middleware/spacesS3");

/** Controllers */
const peakHourController = require("../../../controllers/Mobility/PeakHour");

router.get("/listAll", peakHourController.method.listAll);
router.get("/paginator", auth, checkFranchises, peakHourController.method.paginator);

router.get("/list/:id?", peakHourController.method.list);
router.get("/:id?", peakHourController.method.list);
router.post("/", s3Spaces, peakHourController.method.create);
router.put("/:id", s3Spaces, peakHourController.method.update);
router.delete("/:id", peakHourController.method.remove);

module.exports = router;
