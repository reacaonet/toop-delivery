import { Router } from "express";
import settingsController from "../controllers/settings.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", settingsController.get);
router.put("/", authenticate, settingsController.update);

export default router;
