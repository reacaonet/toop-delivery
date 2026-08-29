import { Router } from "express";
import marketingController from "../controllers/marketing.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/campaign", authenticate, marketingController.listCampaigns);
router.get("/campaign/:id", authenticate, marketingController.getCampaign);
router.post("/campaign", authenticate, marketingController.createCampaign);
router.put("/campaign/:id", authenticate, marketingController.updateCampaign);
router.delete("/campaign/:id", authenticate, marketingController.deleteCampaign);

export default router;
