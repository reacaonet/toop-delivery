import { Router } from "express";
import looseDeliveryController from "../controllers/loose-delivery.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, looseDeliveryController.create);
router.get("/address", authenticate, looseDeliveryController.address);

export default router;