const router = require("express").Router();

/** middleware */
const auth = require("../../../middleware/token");
const checkFranchises = require("../../../middleware/checkFranchises");
const s3Spaces = require("../../../middleware/spacesS3");

/** Controllers */
const documentTypeController = require("../../../controllers/Mobility/DocumentType");

router.get("/listAll", documentTypeController.method.listAll);
router.get("/graphic", documentTypeController.method.graphList);
router.get("/paginator", auth, checkFranchises, documentTypeController.method.paginator);
router.get("/search", documentTypeController.method.search);

router.get("/list/:id?", documentTypeController.method.list);
router.get("/:id?", documentTypeController.method.list);
router.post("/", s3Spaces, documentTypeController.method.create);
router.put("/:id", s3Spaces, documentTypeController.method.update);
router.delete("/:id", documentTypeController.method.remove);

module.exports = router;
