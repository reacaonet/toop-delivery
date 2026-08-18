const router = require("express").Router();

const s3Spaces = require("../middleware/spacesS3");
const checkFranchises = require("../middleware/checkFranchises");
const sliderController = require("../controllers/Slider");

router.get("/paginator", checkFranchises, sliderController.method.paginator);
router.get("/list", checkFranchises, sliderController.method.list);
//router.post('/create', sliderController.method.create);
router.post("/register", sliderController.method.register);
//router.put('/update/:id', sliderController.method.update);
router.delete("/delete/:id", sliderController.method.remove);

router.post("/create", s3Spaces, sliderController.method.create);
router.put("/update/:id", s3Spaces, sliderController.method.update);

module.exports = router;
