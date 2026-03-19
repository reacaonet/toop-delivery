const router = require("express").Router();

const tipController = require("../controllers/TipDeliveryMan");

router.get("/list", tipController.method.list);
router.post("/create", tipController.method.create);
router.delete("/delete/:id", tipController.method.remove);

module.exports = router;
