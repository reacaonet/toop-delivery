const router = require("express").Router();

const cityController = require("../../controllers/Setting/City");

router.get("/normalize-cities", cityController.method.normalizeCities);

router.get("/paginator", cityController.method.paginator);
router.get("/", cityController.method.list);
router.post("/", cityController.method.create);
router.put("/:id", cityController.method.update);
router.delete("/:id", cityController.method.remove);

module.exports = router;
