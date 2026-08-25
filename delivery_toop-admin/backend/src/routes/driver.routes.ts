import { Router } from "express";
import driverController from "../controllers/driver.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createDriverSchema,
  updateDriverSchema,
  updateLocationSchema,
} from "../validators/driver";

const router = Router();

router.get("/", authenticate, driverController.list);
router.get("/nearby", authenticate, driverController.findNearby);
router.get("/:id", authenticate, driverController.getById);
router.post(
  "/",
  authenticate,
  validate(createDriverSchema),
  driverController.create
);
router.put(
  "/:id",
  authenticate,
  validate(updateDriverSchema),
  driverController.update
);
router.put(
  "/me/location",
  authenticate,
  validate(updateLocationSchema),
  driverController.updateLocation
);
router.put("/me/availability", authenticate, driverController.toggleAvailability);
router.put("/me/online", authenticate, driverController.toggleOnline);
router.delete("/:id", authenticate, driverController.delete);

export default router;
