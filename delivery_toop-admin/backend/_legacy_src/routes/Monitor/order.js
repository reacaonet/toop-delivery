const router = require("express").Router();

/** Middleware */
const checkFranchises = require("../../middleware/checkFranchises");

/** Controllers */
const ListController = require("../../controllers/Monitor/Order/ListController");
const DetailController = require("../../controllers/Monitor/Order/DetailController");

router.get("/", checkFranchises, ListController().list);
router.get("/:orderId", DetailController().detail);
module.exports = router;
