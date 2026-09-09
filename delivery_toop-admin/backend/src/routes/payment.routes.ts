import { Router } from "express";
import paymentController from "../controllers/payment.controller";
import paymentGatewayController from "../controllers/payment-gateway.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

// ---------- repasse (server-side) ----------
router.get("/repasse/company/:company", paymentGatewayController.repasseSummary);
router.get("/repasse", paymentGatewayController.repasseSplits);

// ---------- gateway (proxy -> microserviço payment 8400) ----------
router.post("/card", paymentGatewayController.tokenizeCard);
router.get("/card/:tokenCard", paymentGatewayController.cardByToken);
router.post("/charge", paymentGatewayController.charge);
router.post("/pix/charge", paymentGatewayController.pixCharge);
router.post("/cancellation/:paymentId", paymentGatewayController.cancel);
router.put("/cancellation-partial/:paymentId", paymentGatewayController.cancelPartial);

// ---------- invoice ----------
router.get("/invoice/receivable", paymentGatewayController.invoiceReceivable);
router.get("/invoice", paymentGatewayController.listInvoices);
router.get("/invoice/:id", paymentGatewayController.getInvoice);
router.post("/invoice", paymentGatewayController.createInvoice);

// ---------- recipients / split ----------
router.post("/recipient", paymentGatewayController.createRecipient);
router.put("/recipient/:recipientId", paymentGatewayController.updateRecipient);
router.post("/split/after/:paymentId", paymentGatewayController.splitAfter);

// ---------- info / transações ----------
router.get("/transaction/:paymentId", paymentGatewayController.transactionInfo);
router.get("/transactions", paymentGatewayController.transactionsList);

// ---------- pagamentos (model local) ----------
router.get("/", paymentController.list);
router.get("/:id", paymentController.getById);

export default router;