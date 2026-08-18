const router = require("express").Router();

const scheduleController = require("../../controllers/Shopping/Schedule");

router.get("/all", scheduleController.method.all);

router.get("/have/:company", scheduleController.method.haveSchedule);
router.get("/:company", scheduleController.method.list);
router.post("/:company", scheduleController.method.create);
router.put("/type", scheduleController.method.updateType);
router.put("/:id", scheduleController.method.update);
router.delete("/:id", scheduleController.method.remove);

module.exports = router;
