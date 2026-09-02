import { Router } from "express";
import monitorController from "../controllers/monitor.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// mount at /monitor
router.get("/order", authenticate, monitorController.listOrders);
router.get("/order/:orderId", authenticate, monitorController.detailOrder);
router.get("/sales", authenticate, monitorController.salesLastDay);

export default router;
