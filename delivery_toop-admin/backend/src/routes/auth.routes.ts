import { Router } from "express";
import authController from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { loginSchema, refreshSchema } from "../validators/auth";

const router = Router();

router.post("/", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refresh);

export default router;
