import { Router } from "express";
import promoController from "../controllers/promo.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/validate", authenticate, promoController.validate);
router.get("/", authenticate, promoController.list);
router.post("/", authenticate, promoController.create);
router.put("/:id", authenticate, promoController.update);
router.patch("/:id/toggle", authenticate, promoController.toggle);
router.delete("/:id", authenticate, promoController.delete);

export default router;