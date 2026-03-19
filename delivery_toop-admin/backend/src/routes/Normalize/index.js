const router = require("express").Router();

const normalizeFranchisesInOrderStatus = require("../../controllers/Normalize/normalizeFranchisesInOrderStatus");
const normalizeFranchisesInPayment = require("../../controllers/Normalize/normalizeFranchisesInPayment");

router.get("/franchise-in-orders", normalizeFranchisesInOrderStatus);
router.get("/franchise-in-paymnets", normalizeFranchisesInPayment);

module.exports = router;
