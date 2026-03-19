const router = require("express").Router();

/** middleware */
const auth = require("../../../middleware/token");
const checkFranchises = require("../../../middleware/checkFranchises");
const s3Spaces = require("../../../middleware/spacesS3");

/** Controllers */
const driversController = require("../../../controllers/Mobility/Drivers");

router.get("/list/:id?", driversController.method.list);
router.get("/paginator", auth, checkFranchises, driversController.method.paginator);
router.get("/:id?", driversController.method.list);
router.post("/", auth, checkFranchises, s3Spaces, driversController.method.create);
router.put("/:id", s3Spaces, driversController.method.update);
router.delete("/:id", driversController.method.remove);

module.exports = router;
