import { Router } from "express";
import franchiseController from "../controllers/franchise.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, franchiseController.list);
router.get("/paginator", authenticate, franchiseController.paginator);
router.get("/list-all", authenticate, franchiseController.listAll);
router.get("/search", authenticate, franchiseController.search);
router.get("/config/:company", authenticate, franchiseController.configurations);
router.get("/:id", authenticate, franchiseController.get);
router.post("/public", franchiseController.create);
router.post("/", authenticate, franchiseController.create);
router.put("/:id", authenticate, franchiseController.update);
router.delete("/:id", authenticate, franchiseController.remove);

export default router;