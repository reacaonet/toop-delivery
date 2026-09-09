import { Router } from 'express';
import paymentGatewayController from '../controllers/payment-gateway.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Caminhos legados do Braspag apontando para o microserviço de pagamento (8400)
router.get('/transactions', paymentGatewayController.transactionsList);
router.get('/transaction/:paymentId/:merchantId', paymentGatewayController.transactionInfo);
router.post('/capture', paymentGatewayController.charge);

// Recebimento/notificação: sem endpoint equivalente no microserviço (degradação clara)
router.get('/receive', (_req, res) =>
  res.status(400).json({
    success: false,
    error: 'Endpoint de recebimento Braspag não disponível no microserviço de pagamento',
  })
);
router.post('/notification', (_req, res) =>
  res.status(400).json({
    success: false,
    error: 'Inbound de notificação Braspag não disponível no microserviço de pagamento',
  })
);

export default router;