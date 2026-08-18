const router = require("express").Router();

/** Middleware */
const checkFranchises = require("../../middleware/checkFranchises");

/** Controller */
const ListController = require("../../controllers/Monitor/Sales/lastDayController");

router.get("/", checkFranchises, ListController().list);
module.exports = router;
