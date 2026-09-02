import { Router } from "express";
import accessFlowController from "../controllers/access-flow.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/create", accessFlowController.create);
router.get("/list", authenticate, accessFlowController.list);
router.get("/statistic", authenticate, accessFlowController.statistic);

export default router;
