import { Router } from "express";
import userController from "../controllers/user.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createUserSchema, updateUserSchema } from "../validators/user";

const router = Router();

router.get("/", authenticate, userController.list);
router.get("/:id", authenticate, userController.getById);
router.post(
  "/",
  authenticate,
  validate(createUserSchema),
  userController.create
);
router.put(
  "/:id",
  authenticate,
  validate(updateUserSchema),
  userController.update
);
router.delete("/:id", authenticate, userController.delete);

export default router;
