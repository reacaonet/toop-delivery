import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import companyRoutes from "./company.routes";
import orderRoutes from "./order.routes";
import deliverymanRoutes from "./deliveryman.routes";
import paymentRoutes from "./payment.routes";
import notificationRoutes from "./notification.routes";
import categoryRoutes from "./category.routes";
import productRoutes from "./product.routes";
import cartRoutes from "./cart.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/companies", companyRoutes);
router.use("/orders", orderRoutes);
router.use("/deliverymen", deliverymanRoutes);
router.use("/payments", paymentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);

export default router;
