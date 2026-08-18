const router = require("express").Router();

/** middleware */
const auth = require("../../../middleware/token");
const checkFranchises = require("../../../middleware/checkFranchises");

/** controllers */
const { list } = require("../../../controllers/Mobility/vehicleDocuments/ListController");
const Paginator = require("../../../controllers/Mobility/vehicleDocuments/PaginatorController");
const updateController = require("../../../controllers/Mobility/vehicleDocuments/UpdateController");
const createController = require("../../../controllers/Mobility/vehicleDocuments/CreateController");

router.get("/paginator", auth, checkFranchises, Paginator);
router.get("/:driver", list);
router.post("/", createController);
router.put("/:id", updateController);

module.exports = router;
