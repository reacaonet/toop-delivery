import { Router } from "express";
import authController from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { loginSchema, refreshSchema, registerSchema, registerDeliverymanSchema } from "../validators/auth";

const router = Router();

router.post("/", validate(loginSchema), authController.login);
router.post("/register", validate(registerSchema), authController.register);
router.post("/register-deliveryman", validate(registerDeliverymanSchema), authController.registerDeliveryman);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.get("/me", authenticate, authController.me);

export default router;
