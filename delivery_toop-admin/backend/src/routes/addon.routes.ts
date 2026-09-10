import { Router } from "express";
import addonController from "../controllers/addon.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, addonController.list);
router.post("/", authenticate, addonController.create);
router.put("/:id", authenticate, addonController.update);
router.delete("/:id", authenticate, addonController.remove);

export default router;