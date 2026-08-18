const router = require("express").Router();

const shopperController = require("../controllers/Shopper");

const checkFranchises = require("../middleware/checkFranchises");

router.get("/paginator", checkFranchises, shopperController.method.paginator);
router.get("/", shopperController.method.list);
router.post("/", shopperController.method.create);
router.put("/:id", shopperController.method.update);
router.delete("/:id", shopperController.method.remove);
router.get("/search", checkFranchises, shopperController.method.search);

module.exports = router;
