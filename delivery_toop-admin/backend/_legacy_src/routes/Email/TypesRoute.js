const router = require("express").Router();

const Type = require("../../controllers/Email/Type");

router.get("/paginator", Type.method.paginator);

router.get("/", Type.method.list);
router.delete("/:id", Type.method.remove);
router.post("/", Type.method.create);
router.put("/:id", Type.method.update);

module.exports = router;
