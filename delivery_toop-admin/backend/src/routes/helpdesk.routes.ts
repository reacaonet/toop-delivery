import { Router } from "express";
import helpdeskController from "../controllers/helpdesk.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// ---------- Tickets ----------
router.get("/tickets", authenticate, helpdeskController.listTickets);
router.post("/tickets", authenticate, helpdeskController.createTicket);
router.get("/tickets/protocol/:protocol", authenticate, helpdeskController.getTicketByProtocol);
router.get("/tickets/:id", authenticate, helpdeskController.getTicket);
router.put("/tickets/:id", authenticate, helpdeskController.updateTicket);
router.delete("/tickets/:id", authenticate, helpdeskController.deleteTicket);

// ---------- Interactions ----------
router.get("/tickets/:ticket_id/interactions", authenticate, helpdeskController.listTicketInteractions);
router.post("/tickets/:ticket_id/interactions", authenticate, helpdeskController.createInteraction);
router.put("/ticketinterations/:id", authenticate, helpdeskController.updateInteraction);
router.delete("/ticketinterations/:id", authenticate, helpdeskController.deleteInteraction);

export default router;
