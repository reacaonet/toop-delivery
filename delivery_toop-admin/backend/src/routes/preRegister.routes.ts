import { Router } from "express";
import preRegisterController from "../controllers/preRegister.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// Painel (autenticado)
router.get("/paginator", authenticate, preRegisterController.paginator);

// Fluxo público de pré-registro (como no legado)
router.get("/dynamic", preRegisterController.listViews);
router.post("/dynamic", preRegisterController.createDynamic);
router.post("/dynamic-record/:id", preRegisterController.saveDynamicRecord);
router.get("/:phone", preRegisterController.listByPhone);
router.post("/", preRegisterController.create);
router.put("/:id", preRegisterController.update);
router.delete("/:id", preRegisterController.remove);

export default router;
