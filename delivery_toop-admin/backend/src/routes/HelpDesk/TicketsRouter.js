const router = require("express").Router();

const ticketsController = require("../../controllers/HelpDesk/Tickets");
const ticketInterationController = require("../../controllers/HelpDesk/TicketInteration");

router.get("/paginator", ticketsController.method.paginator);
router.get("/listPorNome", ticketsController.method.listPorNome);
router.get("/:protocol", ticketsController.method.protocol);
router.get("/", ticketsController.method.list);
router.post("/", ticketsController.method.create);
router.delete("/:id", ticketsController.method.remove);
router.put("/:id", ticketsController.method.update);
router.post("/:ticket_id/interactions", ticketInterationController.method.create);

module.exports = router;
