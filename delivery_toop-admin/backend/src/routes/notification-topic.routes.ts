import { Router } from "express";
import notificationTopicController from "../controllers/notification-topic.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, notificationTopicController.create);
router.post("/send", authenticate, notificationTopicController.send);

export default router;
