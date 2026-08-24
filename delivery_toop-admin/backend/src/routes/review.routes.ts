import { Router } from "express";
import reviewController from "../controllers/review.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, reviewController.create);
router.get("/company/:companyId", reviewController.listByCompany);
router.get("/order/:orderId", reviewController.listByOrder);
router.get("/reviewable", authenticate, reviewController.getReviewableOrders);

export default router;
