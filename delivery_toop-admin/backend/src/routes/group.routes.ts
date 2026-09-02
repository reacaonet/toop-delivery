import { Router } from "express";
import groupController from "../controllers/group.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/paginator", authenticate, groupController.paginator);
router.get("/list", authenticate, groupController.list);
router.get("/listPorNome", authenticate, groupController.listPorNome);
router.get("/:id", authenticate, groupController.get);
router.post("/", authenticate, groupController.create);
router.put("/:id", authenticate, groupController.update);
router.delete("/:id", authenticate, groupController.remove);

export default router;
