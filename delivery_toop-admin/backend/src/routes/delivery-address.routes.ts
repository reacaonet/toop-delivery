import { Router } from "express";
import deliveryAddressController from "../controllers/delivery-address.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/list/:id?", authenticate, deliveryAddressController.list);
router.get("/search", authenticate, deliveryAddressController.search);
router.get("/:id", authenticate, deliveryAddressController.get);
router.post("/create", authenticate, deliveryAddressController.create);
router.put("/update/:id", authenticate, deliveryAddressController.update);
router.delete("/delete/:id", authenticate, deliveryAddressController.remove);

export default router;