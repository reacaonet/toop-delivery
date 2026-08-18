import { Router } from "express";
import notificationController from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, notificationController.list);
router.get("/:id", authenticate, notificationController.getById);

export default router;
