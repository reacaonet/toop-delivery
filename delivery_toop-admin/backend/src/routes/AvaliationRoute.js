const router = require("express").Router();
const avaliationController = require("../controllers/Avaliation");

router.post("/create", avaliationController.method.create);
router.get("/search", avaliationController.method.search);
router.get("/listMediaAvaliation", avaliationController.method.list);

module.exports = router;
