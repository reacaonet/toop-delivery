const router = require("express").Router();

const registerDeliveryManController = require("../controllers/RegisterDeliveryMan");

const checkFranchises = require("../middleware/checkFranchises");

router.get(
  "/paginator",
  checkFranchises,
  registerDeliveryManController.method.paginator
);
router.post("/create", registerDeliveryManController.method.create);
router.get("/list", registerDeliveryManController.method.list);
router.put("/status/:id", registerDeliveryManController.method.update);

module.exports = router;
