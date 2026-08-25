import { Router } from "express";
import messageController from "../controllers/message.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/:bookingId", authenticate, messageController.getByBooking);
router.post("/:bookingId", authenticate, messageController.send);
router.put("/:bookingId/read", authenticate, messageController.markAsRead);
router.get("/:bookingId/unread", authenticate, messageController.getUnreadCount);

export default router;
