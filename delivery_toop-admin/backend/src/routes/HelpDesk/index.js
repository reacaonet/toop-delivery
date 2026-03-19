const router = require("express").Router();

const checkFranchises = require("../../middleware/checkFranchises");

/** Routes */
const ticketsRoute = require("./TicketsRouter");
const ticketInterationRoute = require("./TicketInterationRouter");

router.use("/tickets", checkFranchises, ticketsRoute);
router.use("/ticketinteration", checkFranchises, ticketInterationRoute);

module.exports = router;
