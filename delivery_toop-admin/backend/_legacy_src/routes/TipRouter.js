const router = require("express").Router();

const tipController = require("../controllers/Tip");

router.get("/list", tipController.method.list);
router.post("/create", tipController.method.create);
router.delete("/delete/:id", tipController.method.remove);
router.get("/search/", tipController.method.search);

module.exports = router;
