import { Router } from "express";
import paymentController from "../controllers/payment.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, paymentController.list);
router.get("/:id", authenticate, paymentController.getById);

export default router;
