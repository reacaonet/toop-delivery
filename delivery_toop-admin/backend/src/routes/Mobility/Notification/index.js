const router = require("express").Router();

/** middleware */
const auth = require("../../../middleware/token");
const checkFranchises = require("../../../middleware/checkFranchises");
const s3Spaces = require("../../../middleware/spacesS3");

const notificationController = require("../../../controllers/Mobility/Notification");

router.get("/listAll", notificationController.method.listAll);
router.get("/graphic", notificationController.method.graphList);
router.get("/paginator", auth, checkFranchises, notificationController.method.paginator);
router.get("/search", notificationController.method.search);

router.get("/list/:id?", notificationController.method.list);
router.get("/:id?", notificationController.method.list);
router.post("/", s3Spaces, notificationController.method.create);
router.put("/:id", s3Spaces, notificationController.method.update);
router.delete("/:id", notificationController.method.remove);

module.exports = router;
