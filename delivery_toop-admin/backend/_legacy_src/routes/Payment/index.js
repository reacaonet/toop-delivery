const router = require("express").Router();
const PaymentTest = require("../../controllers/Payment");
const PaymentController = require("../../controllers/Shopping/Payment");

router.post("/send/cart/:cartId", PaymentController.method.create);
router.get("/search", PaymentController.method.search);
router.get("/:id", PaymentController.method.listOne);
router.get("/customer/:customerId", PaymentController.method.listPayCustomer);
router.get(
  "/customerActive/:customerId",
  PaymentController.method.listPayCustomerActive
);

// Cancelar um Pedido
router.put("/cancel/order/:orderId", PaymentController.method.cancel);

// Rotas de Testes
router.post("/sales", PaymentTest.method.sales);
router.get("/sales/token", PaymentTest.method.token);
router.post("/sales/card", PaymentTest.method.saveCard);
router.get("/sales/card", PaymentTest.method.getCard);
router.post("/sales/zero-auth", PaymentTest.method.zeroAuth);
router.get("/sales/payment/:id", PaymentTest.method.getPaymentCredit);
router.post("/sales/capture", PaymentTest.method.capture);
router.post("/sales/capture/partial", PaymentTest.method.capturePartial);
router.post("/sales/cancel", PaymentTest.method.cancel);
router.post("/sales/cancel/partial", PaymentTest.method.cancelPartial);
// Rotas de Testes

module.exports = router;
