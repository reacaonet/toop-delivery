import { Router } from "express";
import cartController from "../controllers/cart.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, cartController.listCarts);
router.get("/:companyId", authenticate, cartController.getCart);
router.post("/:companyId/items", authenticate, cartController.addItem);
router.put("/:cartId/items/:itemId", authenticate, cartController.updateItemQuantity);
router.delete("/:cartId/items/:itemId", authenticate, cartController.removeItem);

export default router;
