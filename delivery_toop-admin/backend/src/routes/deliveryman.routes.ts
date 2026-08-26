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
router.get("/me", authenticate, deliverymanController.getMe);
router.get("/:id", authenticate, deliverymanController.getById);
router.post(
  "/",
  authenticate,
  validate(createDeliverymanSchema),
  deliverymanController.create
);
router.put("/me", authenticate, validate(updateDeliverymanSchema), deliverymanController.updateMe);
router.put("/me/availability", authenticate, deliverymanController.toggleAvailability);
router.put("/me/driver-mode", authenticate, deliverymanController.toggleDriverMode);
router.put("/me/driver-online", authenticate, deliverymanController.toggleDriverOnline);
router.put("/me/driver-available", authenticate, deliverymanController.toggleDriverAvailable);
router.put("/me/location", authenticate, deliverymanController.updateLocation);
router.put("/me/address", authenticate, deliverymanController.updateAddress);
router.put(
  "/:id",
  authenticate,
  validate(updateDeliverymanSchema),
  deliverymanController.update
);
router.delete("/:id", authenticate, deliverymanController.delete);

export default router;
