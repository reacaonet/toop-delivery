import { Router } from "express";
import notificationController from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, notificationController.list);
router.post("/", authenticate, notificationController.create);
router.post("/send", authenticate, notificationController.createAndSend);

router.get("/my/unread-count", authenticate, notificationController.unreadCount);
router.get("/my", authenticate, notificationController.listMine);
router.put("/my/read-all", authenticate, notificationController.markAllRead);
router.put("/my/:id/read", authenticate, notificationController.markRead);
router.put("/my/:id/dismiss", authenticate, notificationController.dismiss);

router.get("/:id", authenticate, notificationController.getById);
router.put("/:id", authenticate, notificationController.update);
router.delete("/:id", authenticate, notificationController.remove);

export default router;
