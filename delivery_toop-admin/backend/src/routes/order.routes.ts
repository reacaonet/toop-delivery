import { Router } from "express";
import orderController from "../controllers/order.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validators/order";

const router = Router();

router.get("/", authenticate, orderController.list);
router.get("/:id", authenticate, orderController.getById);
router.post(
  "/",
  authenticate,
  validate(createOrderSchema),
  orderController.create
);
router.put(
  "/:id/status",
  authenticate,
  validate(updateOrderStatusSchema),
  orderController.updateStatus
);
router.put("/:id/cancel", authenticate, orderController.cancel);
router.delete("/:id", authenticate, orderController.cancel);

export default router;
