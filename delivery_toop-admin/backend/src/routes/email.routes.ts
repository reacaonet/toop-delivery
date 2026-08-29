import { Router } from "express";
import emailController from "../controllers/email.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// ---------- Types ----------
router.get("/types", authenticate, emailController.listTypes);
router.post("/types", authenticate, emailController.createType);
router.put("/types/:id", authenticate, emailController.updateType);
router.delete("/types/:id", authenticate, emailController.deleteType);

// ---------- Templates ----------
router.get("/templates", authenticate, emailController.listTemplates);
router.post("/templates", authenticate, emailController.createTemplate);
router.put("/templates/:id", authenticate, emailController.updateTemplate);
router.delete("/templates/:id", authenticate, emailController.deleteTemplate);

// ---------- Variables ----------
router.get("/variables", authenticate, emailController.listVariables);

export default router;
