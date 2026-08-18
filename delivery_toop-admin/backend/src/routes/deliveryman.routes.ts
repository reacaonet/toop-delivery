import { Router } from "express";
import deliverymanController from "../controllers/deliveryman.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createDeliverymanSchema,
  updateDeliverymanSchema,
} from "../validators/deliveryman";

const router = Router();

router.get("/", authenticate, deliverymanController.list);
router.get("/:id", authenticate, deliverymanController.getById);
router.post(
  "/",
  authenticate,
  validate(createDeliverymanSchema),
  deliverymanController.create
);
router.put(
  "/:id",
  authenticate,
  validate(updateDeliverymanSchema),
  deliverymanController.update
);
router.delete("/:id", authenticate, deliverymanController.delete);

export default router;
