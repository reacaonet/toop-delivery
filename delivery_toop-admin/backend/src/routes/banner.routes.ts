import { Router } from "express";
import bannerController from "../controllers/banner.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/active", bannerController.listActive);
router.get("/", authenticate, bannerController.list);
router.get("/:id", authenticate, bannerController.getById);
router.post("/", authenticate, bannerController.create);
router.put("/:id", authenticate, bannerController.update);
router.delete("/:id", authenticate, bannerController.delete);

export default router;
