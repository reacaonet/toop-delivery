const router = require("express").Router();

/** middleware */
const auth = require("../../../middleware/token");
const checkFranchises = require("../../../middleware/checkFranchises");
const s3Spaces = require("../../../middleware/spacesS3");

/** middleware validation */
const AvailableValidate = require("../../../validator/mobility/service/available.validate");

/** controllers */
const serviceController = require("../../../controllers/Mobility/Service");
const Available = require("../../../controllers/Mobility/Service/AvailableController");

router.get("/listAll", serviceController.method.listAll);
router.get("/graphic", serviceController.method.graphList);
router.get("/paginator", auth, checkFranchises, serviceController.method.paginator);
router.get("/search", auth, checkFranchises, serviceController.method.search);
router.get("/list-front", serviceController.method.listFront);

router.get("/list/:id?", serviceController.method.list);
router.get("/available", AvailableValidate, Available);
router.get("/:id?", serviceController.method.list);
router.post("/", s3Spaces, serviceController.method.create);
router.put("/:id", s3Spaces, serviceController.method.update);
router.delete("/:id", serviceController.method.remove);

module.exports = router;
