import { Router } from "express";
import categoryController from "../controllers/category.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/public", categoryController.listPublic);
router.get("/", authenticate, categoryController.list);
router.get("/:id", authenticate, categoryController.getById);
router.post("/", authenticate, categoryController.create);
router.put("/:id", authenticate, categoryController.update);
router.delete("/:id", authenticate, categoryController.delete);

export default router;
