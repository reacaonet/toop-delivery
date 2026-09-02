import { Router } from "express";
import shopperController from "../controllers/shopper.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, shopperController.listControllers);
router.get("/paginator", authenticate, shopperController.list);
router.get("/search", authenticate, shopperController.search);
router.get("/:id", authenticate, shopperController.get);
router.post("/", authenticate, shopperController.create);
router.put("/:id", authenticate, shopperController.update);
router.delete("/:id", authenticate, shopperController.remove);

export default router;
