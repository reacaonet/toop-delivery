const router = require("express").Router();

const siteController = require("../../controllers/site");
const checkFranchises = require("../../middleware/checkFranchises");

router.get("/paginator", checkFranchises, siteController.method.paginator);
router.get("/", checkFranchises, siteController.method.list);
router.post("/", siteController.method.create);
router.delete("/:id", siteController.method.remove);
router.put("/:id", siteController.method.update);

module.exports = router;
