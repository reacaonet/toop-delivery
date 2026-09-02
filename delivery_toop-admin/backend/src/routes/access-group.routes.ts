import { Router } from "express";
import accessGroupController from "../controllers/access-group.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/tree", authenticate, accessGroupController.tree);
router.get("/", authenticate, accessGroupController.tree);
router.post("/", authenticate, accessGroupController.create);
router.put("/:id", authenticate, accessGroupController.update);
router.delete("/:id", authenticate, accessGroupController.remove);

export default router;
