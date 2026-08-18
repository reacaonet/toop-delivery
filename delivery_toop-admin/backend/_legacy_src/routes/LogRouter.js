const router = require("express").Router();

const logController = require("../controllers/Log");

router.get("/paginator?", logController.method.paginator);
router.post("/create", logController.method.create);
router.get("/:id?", logController.method.list);

module.exports = router;
