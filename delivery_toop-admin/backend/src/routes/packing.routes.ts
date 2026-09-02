import { Router } from "express";
import packingController from "../controllers/packing.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, packingController.list);
router.get("/paginator", authenticate, packingController.list);
router.get("/list-all", authenticate, packingController.listAll);
router.get("/list-by-name", authenticate, packingController.listByName);
router.get("/:id", authenticate, packingController.get);
router.post("/", authenticate, packingController.create);
router.put("/:id", authenticate, packingController.update);
router.delete("/:id", authenticate, packingController.remove);

export default router;
