import { Router } from "express";
import guestController from "../controllers/guest.controller";

const router = Router();

router.post("/", guestController.create);
router.put("/", guestController.update);
router.get("/:device", guestController.get);

export default router;