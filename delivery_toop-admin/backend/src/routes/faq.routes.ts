import { Router } from "express";
import helpdeskController from "../controllers/helpdesk.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, helpdeskController.listFaqs);
router.get("/:id", authenticate, helpdeskController.getFaq);
router.post("/", authenticate, helpdeskController.createFaq);
router.put("/:id", authenticate, helpdeskController.updateFaq);
router.delete("/:id", authenticate, helpdeskController.deleteFaq);

export default router;
