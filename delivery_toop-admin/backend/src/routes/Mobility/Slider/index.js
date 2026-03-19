const router = require("express").Router();

/** middleware */
const auth = require("../../../middleware/token");
const checkFranchises = require("../../../middleware/checkFranchises");
const s3Spaces = require("../../../middleware/spacesS3");

const sliderController = require("../../../controllers/Mobility/Slider");

router.get("/paginator", auth, checkFranchises, sliderController.method.paginator);
router.get("/:id?", sliderController.method.list);
router.post("/", s3Spaces, sliderController.method.create);
router.put("/:id", s3Spaces, sliderController.method.update);
router.delete("/:id", sliderController.method.remove);

module.exports = router;
