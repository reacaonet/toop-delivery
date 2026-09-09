import { Router } from "express";
import walletController from "../controllers/wallet.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/balance", authenticate, walletController.getBalance);
router.get("/transactions", authenticate, walletController.getTransactions);
router.get("/withdrawals", authenticate, walletController.listWithdrawals);
router.post("/withdrawals/:id/approve", authenticate, walletController.approveWithdrawal);
router.post("/withdrawals/:id/reject", authenticate, walletController.rejectWithdrawal);
router.post("/credit", authenticate, walletController.credit);
router.post("/debit", authenticate, walletController.debit);
router.post("/withdraw", authenticate, walletController.requestWithdrawal);

export default router;
