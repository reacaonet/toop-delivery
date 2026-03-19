const router = require("express").Router();

/** middleware */
const auth = require("../../../middleware/token");
const checkFranchises = require("../../../middleware/checkFranchises");
const s3Spaces = require("../../../middleware/spacesS3");

/** Controller */
const supportSubjectController = require("../../../controllers/Mobility/SupportSubject");

router.get("/listAll", supportSubjectController.method.listAll);
router.get("/graphic", supportSubjectController.method.graphList);
router.get("/paginator", auth, checkFranchises, supportSubjectController.method.paginator);
router.get("/search", supportSubjectController.method.search);

router.get("/list/:id?", supportSubjectController.method.list);
router.get("/:id?", supportSubjectController.method.list);
router.post("/", s3Spaces, supportSubjectController.method.create);
router.put("/:id", s3Spaces, supportSubjectController.method.update);
router.delete("/:id", supportSubjectController.method.remove);

module.exports = router;
