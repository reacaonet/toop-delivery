process.env.JWT_SECRET = 'test-secret';
process.env.JWT_SECRET_REFRESH = 'test-refresh';
process.env.MONGO_ADMIN_USER = 'test';
process.env.MONGO_ADMIN_PASSWORD = 'test';
process.env.URL_MONGO = 'localhost:27017';
process.env.PAYMENT_DEV_MODE = 'true';

jest.mock('axios', () => ({
  request: jest.fn(() => {
    throw new Error('rede não deveria ser chamada em modo sandbox');
  }),
  post: jest.fn(() => {
    throw new Error('rede não deveria ser chamada em modo sandbox');
  }),
}));

import paymentGatewayService from '../services/payment-gateway.service';

describe('PaymentGatewayService sandbox (PAYMENT_DEV_MODE=true)', () => {
  it('tokenizeCard retorna token dev sem chamar a rede', async () => {
    const result = await paymentGatewayService.tokenizeCard({ CardNumber: '4111111111111111' } as any);
    expect(result.data.token).toMatch(/^devtok_/);
  });

  it('pagarmeTransaction retorna id dev e status paid', async () => {
    const result = await paymentGatewayService.pagarmeTransaction({ amount: 5000 } as any);
    expect(result.data.id).toMatch(/^devtrx_/);
    expect(result.data.status).toBe('paid');
  });

  it('pixCharge retorna txid e pix_qr_code dev', async () => {
    const result = await paymentGatewayService.pixCharge({ amount: 5000 } as any);
    expect(result.data.txid).toMatch(/^devpix_/);
    expect(result.data.pix_qr_code).toBeTruthy();
  });

  it('cancelTransaction retorna status cancelado em sandbox', async () => {
    const result = await paymentGatewayService.cancelTransaction('devtrx_abc');
    expect(result.data.status).toBe('canceled');
  });
});