import { Router } from "express";
import walletController from "../controllers/wallet.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/balance", authenticate, walletController.getBalance);
router.get("/transactions", authenticate, walletController.getTransactions);
router.post("/credit", authenticate, walletController.credit);
router.post("/debit", authenticate, walletController.debit);

export default router;
