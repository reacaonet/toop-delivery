const router = require("express").Router();

const s3Spaces = require("../../middleware/spacesS3");
const segmentController = require("../../controllers/Company/Segment");
const checkFranchises = require("../../middleware/checkFranchises");

router.get('/list-category/location/:latitude/:longitude', segmentController.method.listCategory) /** app */
router.get('/list-category/company/:company', segmentController.method.listCompanyCategory) /** Frontend  */
router.get('/franchise/:id', segmentController.method.segmentoToFranchise) /** Frontend Public  */
router.get('/one/:id', segmentController.method.listOne)  /** app */

router.delete("/:id", segmentController.method.remove);
router.get("/paginator", checkFranchises, segmentController.method.paginator);
router.get("/", checkFranchises, segmentController.method.list);
router.post("/", s3Spaces, segmentController.method.create);
router.put("/:id", s3Spaces, segmentController.method.update);

module.exports = router;
