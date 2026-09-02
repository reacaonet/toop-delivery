import { Router } from "express";
import accessGroupController from "../controllers/access-group.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// Modules (mount at /settings/modules)
router.get("/modules", authenticate, accessGroupController.listModules);
router.post("/modules", authenticate, accessGroupController.createModule);
router.put("/modules/:id", authenticate, accessGroupController.updateModule);
router.delete("/modules/:id", authenticate, accessGroupController.deleteModule);

// Controllers (mount at /settings/controllers)
router.get("/controllers", authenticate, accessGroupController.listControllers);
router.post("/controllers", authenticate, accessGroupController.createController);
router.put("/controllers/:id", authenticate, accessGroupController.updateController);
router.delete("/controllers/:id", authenticate, accessGroupController.deleteController);

export default router;
