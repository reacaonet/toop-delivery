const router = require("express").Router();

const integrationsController = require("../../controllers/Tools/Integrations");
const checkFranchises = require("../../middleware/checkFranchises");

router.get(
  "/paginator",
  checkFranchises,
  integrationsController.method.paginator
);
router.get(
  "/company/:company",
  checkFranchises,
  integrationsController.method.listOne
);
router.get("/sync-image/:company", integrationsController.method.syncImage);
router.get("/", integrationsController.method.list);
router.post("/", integrationsController.method.create);
router.delete("/:id", integrationsController.method.remove);
router.put("/:id", integrationsController.method.update);

module.exports = router;
