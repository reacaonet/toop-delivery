import { Router } from "express";
import toolsController from "../controllers/tools.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// ---------- Popup ----------
router.get("/popup/paginator", authenticate, toolsController.paginatorPopup);
router.get("/popup", authenticate, toolsController.listPopup);
router.post("/popup", authenticate, toolsController.createPopup);
router.put("/popup/:id", authenticate, toolsController.updatePopup);
router.delete("/popup/:id", authenticate, toolsController.removePopup);
router.put("/popup/updateViews/:id", toolsController.updatePopupViews);
router.get("/popup/listPopupApp/:id", toolsController.listPopupApp);

// ---------- Integrations ----------
router.get("/integrations/paginator", authenticate, toolsController.paginatorIntegration);
router.get("/integrations/company/:company", authenticate, toolsController.listIntegrationByCompany);
router.get("/integrations", authenticate, toolsController.listIntegrations);
router.post("/integrations", authenticate, toolsController.createIntegration);
router.put("/integrations/:id", authenticate, toolsController.updateIntegration);
router.delete("/integrations/:id", authenticate, toolsController.removeIntegration);

export default router;
