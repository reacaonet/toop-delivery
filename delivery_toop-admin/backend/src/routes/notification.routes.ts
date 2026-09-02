import { Router } from "express";
import notificationController from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, notificationController.list);
router.post("/", authenticate, notificationController.create);
router.post("/send", authenticate, notificationController.createAndSend);
router.get("/:id", authenticate, notificationController.getById);
router.put("/:id", authenticate, notificationController.update);
router.delete("/:id", authenticate, notificationController.remove);

export default router;
