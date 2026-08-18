const router = require("express").Router();

/** middleware */
const auth = require("../../../middleware/token");
const checkFranchises = require("../../../middleware/checkFranchises");

/** controllers */
const Paginator = require("../../../controllers/Mobility/discount/PaginatorController");
const Create = require("../../../controllers/Mobility/discount/CreateController");
const Update = require("../../../controllers/Mobility/discount/UpdateController");

router.get("/paginator", auth, checkFranchises, Paginator);
router.post("/", auth, checkFranchises, Create);
router.put("/:id", auth, checkFranchises, Update);

module.exports = router;
