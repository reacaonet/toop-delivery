const router = require("express").Router();

const CampaignController = require("../../../controllers/Cashback/Campaign");
const checkFranchises = require("../../../middleware/checkFranchises");

router.get("/listAll", checkFranchises, CampaignController.method.listAll);
router.get("/paginator", checkFranchises, CampaignController.method.paginator);

router.get("/list/:id?", checkFranchises, CampaignController.method.list);
router.get("/:id?", checkFranchises, CampaignController.method.list);
router.post("/", checkFranchises, CampaignController.method.create);
router.put("/:id", checkFranchises, CampaignController.method.update);
router.delete("/:id", checkFranchises, CampaignController.method.remove);

module.exports = router;
