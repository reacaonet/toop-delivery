import { Router } from "express";
import personController from "../controllers/person.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, personController.list);
router.get("/paginator", authenticate, personController.paginator);
router.get("/listPorNome", authenticate, personController.listPorNome);
router.get("/search", authenticate, personController.search);
router.get("/register-duplicates", authenticate, personController.registerDuplicates);
router.get("/avatar/:id", authenticate, personController.avatar);
router.get("/:id", authenticate, personController.get);
router.post("/", authenticate, personController.create);
router.put("/:id", authenticate, personController.update);
router.delete("/:id", authenticate, personController.remove);

export default router;