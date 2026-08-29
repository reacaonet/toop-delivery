import { Router } from "express";
import financeController from "../controllers/finance.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// ---------- Balances ----------
router.get("/balances", authenticate, financeController.listBalances);
router.get("/balances/company/:id", authenticate, financeController.getCompanyBalance);

// ---------- Cost Center ----------
router.get("/cost-centers", authenticate, financeController.listCostCenters);
router.get("/cost-centers/:id", authenticate, financeController.getCostCenter);
router.post("/cost-centers", authenticate, financeController.createCostCenter);
router.put("/cost-centers/:id", authenticate, financeController.updateCostCenter);
router.delete("/cost-centers/:id", authenticate, financeController.deleteCostCenter);

// ---------- Type Payment ----------
router.get("/type-payments", authenticate, financeController.listTypePayments);
router.get("/type-payments/:id", authenticate, financeController.getTypePayment);
router.post("/type-payments", authenticate, financeController.createTypePayment);
router.put("/type-payments/:id", authenticate, financeController.updateTypePayment);
router.delete("/type-payments/:id", authenticate, financeController.deleteTypePayment);

// ---------- Banks ----------
router.get("/banks", authenticate, financeController.listBanks);
router.get("/banks/:id", authenticate, financeController.getBank);
router.post("/banks", authenticate, financeController.createBank);
router.put("/banks/:id", authenticate, financeController.updateBank);
router.delete("/banks/:id", authenticate, financeController.deleteBank);

// ---------- Agencies ----------
router.get("/agencies", authenticate, financeController.listAgencies);
router.get("/agencies/:id", authenticate, financeController.getAgency);
router.post("/agencies", authenticate, financeController.createAgency);
router.put("/agencies/:id", authenticate, financeController.updateAgency);
router.delete("/agencies/:id", authenticate, financeController.deleteAgency);

// ---------- Digital Accounts ----------
router.get("/digital-accounts", authenticate, financeController.listDigitalAccounts);
router.get("/digital-accounts/:id", authenticate, financeController.getDigitalAccount);
router.get("/digital-accounts/:id/balance", authenticate, financeController.getDigitalAccountBalance);
router.post("/digital-accounts", authenticate, financeController.createDigitalAccount);
router.put("/digital-accounts/:id", authenticate, financeController.updateDigitalAccount);
router.post("/digital-accounts/:id/move", authenticate, financeController.moveDigitalAccount);
router.delete("/digital-accounts/:id", authenticate, financeController.deleteDigitalAccount);

// ---------- Chargeback ----------
router.get("/chargebacks", authenticate, financeController.listChargebacks);
router.get("/chargebacks/:id", authenticate, financeController.getChargeback);
router.post("/chargebacks", authenticate, financeController.createChargeback);
router.put("/chargebacks/:id", authenticate, financeController.updateChargeback);
router.delete("/chargebacks/:id", authenticate, financeController.deleteChargeback);

export default router;
