import { Router } from "express";
import appController from "../controllers/app.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/category", authenticate, appController.listCategories);
router.get("/category/:id", authenticate, appController.getCategory);
router.post("/category", authenticate, appController.createCategory);
router.put("/category/:id", authenticate, appController.updateCategory);
router.delete("/category/:id", authenticate, appController.deleteCategory);

export default router;
