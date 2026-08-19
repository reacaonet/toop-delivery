import { Router } from "express";
import productController from "../controllers/product.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, productController.list);
router.get("/company/:companyId", authenticate, productController.listByCompany);
router.get("/:id", authenticate, productController.getById);
router.post("/", authenticate, productController.create);
router.put("/:id", authenticate, productController.update);
router.delete("/:id", authenticate, productController.delete);

export default router;
