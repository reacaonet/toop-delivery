const router = require("express").Router();

const accessFlowController = require("../../controllers/Access");
const checkFranchises = require("../../middleware/checkFranchises");

router.get(
  "/paginator",
  checkFranchises,
  accessFlowController.method.paginator
);

router.get("/", accessFlowController.method.list);
router.post("/", accessFlowController.method.create);
router.put("/:id", accessFlowController.method.update);
router.delete("/:id", accessFlowController.method.remove);

module.exports = router;
