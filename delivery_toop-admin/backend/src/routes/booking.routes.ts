import { Router } from "express";
import bookingController from "../controllers/booking.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createBookingSchema,
  cancelBookingSchema,
  rateBookingSchema,
} from "../validators/booking";

const router = Router();

router.get("/", authenticate, bookingController.list);
router.get("/stats", authenticate, bookingController.getStats);
router.get("/:id", authenticate, bookingController.getById);
router.post(
  "/",
  authenticate,
  validate(createBookingSchema),
  bookingController.create
);
router.put("/:id/accept", authenticate, bookingController.accept);
router.put("/:id/reject", authenticate, bookingController.reject);
router.put("/:id/start", authenticate, bookingController.start);
router.put("/:id/complete", authenticate, bookingController.complete);
router.put(
  "/:id/cancel",
  authenticate,
  validate(cancelBookingSchema),
  bookingController.cancel
);
router.put(
  "/:id/rate",
  authenticate,
  validate(rateBookingSchema),
  bookingController.rate
);
router.put("/:id/qr-generate", authenticate, bookingController.generateQRCode);
router.put("/:id/qr-verify", authenticate, bookingController.verifyQRCode);

export default router;
