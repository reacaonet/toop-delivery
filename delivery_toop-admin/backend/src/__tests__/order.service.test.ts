import { AppError } from '../middleware/errorHandler';

process.env.JWT_SECRET = 'test-secret';
process.env.MONGO_ADMIN_USER = 'test';
process.env.MONGO_ADMIN_PASSWORD = 'test';
process.env.URL_MONGO = 'localhost:27017';

jest.mock('../models/Order', () => ({
  OrderModel: {
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.mock('../models/User', () => ({
  UserModel: {
    findOne: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.mock('../models/ShoppingPaymentMethod', () => ({
  ShoppingPaymentMethodModel: {
    findOne: jest.fn(),
  },
}));

jest.mock('../services/payment-gateway.service', () => ({
  __esModule: true,
  default: {
    pagarmeTransaction: jest.fn(),
    pixCharge: jest.fn(),
    record: jest.fn(),
  },
}));

import { OrderModel } from '../models/Order';
import { ShoppingPaymentMethodModel } from '../models/ShoppingPaymentMethod';
import { UserModel } from '../models/User';
import paymentGatewayService from '../services/payment-gateway.service';
import orderService from '../services/order.service';

const MockOrderModel = OrderModel as jest.Mocked<typeof OrderModel>;
const MockPaymentMethodModel = ShoppingPaymentMethodModel as jest.Mocked<typeof ShoppingPaymentMethodModel>;
const MockUserModel = UserModel as jest.Mocked<typeof UserModel>;
const MockPaymentGateway = paymentGatewayService as jest.Mocked<typeof paymentGatewayService>;

const baseOrderData = {
  company: 'company123',
  customer: 'customer123',
  items: [{ name: 'Pizza', quantity: 1, price: 45.0, total: 45.0 }],
  subtotal: 45.0,
  deliveryFee: 5.0,
  total: 50.0,
  paymentMethod: 'cash',
  deliveryAddress: { street: 'Rua Teste', number: '123', city: 'Sao Paulo', state: 'SP', zipCode: '01000-000' },
};

describe('OrderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order with generated orderNumber', async () => {
      const mockOrder = { _id: 'order123', ...baseOrderData, orderNumber: '123456001', status: 'pending' };
      MockOrderModel.create.mockResolvedValue(mockOrder as any);

      const result = await orderService.create(baseOrderData);

      expect(MockOrderModel.create).toHaveBeenCalledTimes(1);
      expect(result.orderNumber).toBeDefined();
      expect(result.status).toBe('pending');
    });

    it('should reject inconsistent totals', async () => {
      await expect(
        orderService.create({ ...baseOrderData, total: 55.0 })
      ).rejects.toThrow('Total inconsistente');
      expect(MockOrderModel.create).not.toHaveBeenCalled();
    });

    it('should charge a saved card and mark payment as paid', async () => {
      const card = {
        _id: 'card123',
        cardToken: 'tok_123',
        verifierCode: '123',
        documentType: 'CPF',
        document: '11122233344',
        nameOnCard: 'Fulano de Tal',
      };
      MockPaymentMethodModel.findOne.mockResolvedValue(card as any);
      MockUserModel.findById.mockReturnValue({
        lean: () => Promise.resolve({ name: 'Fulano de Tal', email: 'fulano@test.com', phone: '11999998888' }),
      } as any);
      MockPaymentGateway.pagarmeTransaction.mockResolvedValue({ id: 'tx_1' } as any);
      MockPaymentGateway.record.mockResolvedValue({} as any);
      MockOrderModel.create.mockResolvedValue({
        _id: 'order123',
        ...baseOrderData,
        paymentStatus: 'paid',
      } as any);

      const result = await orderService.create({
        ...baseOrderData,
        paymentMethod: 'credit_card',
        paymentMethodId: 'card123',
      });

      expect(MockPaymentMethodModel.findOne).toHaveBeenCalledWith({
        _id: 'card123',
        customer: 'customer123',
        isDeleted: { $ne: true },
      });
      expect(MockPaymentGateway.pagarmeTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 5000, card_id: 'tok_123', card_cvv: '123' })
      );
      expect(MockOrderModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ paymentStatus: 'paid', paymentMethodId: 'card123' })
      );
      expect(MockPaymentGateway.record).toHaveBeenCalledWith(
        expect.objectContaining({ operation: 'charge', order: 'order123', gatewayId: 'tx_1' })
      );
      expect(result.paymentStatus).toBe('paid');
    });

    it('should require a saved card for card payment', async () => {
      await expect(
        orderService.create({ ...baseOrderData, paymentMethod: 'debit_card' })
      ).rejects.toThrow('Selecione um cartão salvo');
      expect(MockOrderModel.create).not.toHaveBeenCalled();
    });

    it('should generate PIX charge and keep payment pending', async () => {
      MockPaymentGateway.pixCharge.mockResolvedValue({ id: 'pix_1', pix_qr_code: '000201010212' } as any);
      MockPaymentGateway.record.mockResolvedValue({} as any);
      MockOrderModel.create.mockResolvedValue({
        _id: 'order123',
        ...baseOrderData,
        paymentStatus: 'pending',
        pixTxid: 'pix_1',
        pixQrcode: '000201010212',
      } as any);

      const result = await orderService.create({ ...baseOrderData, paymentMethod: 'pix' });

      expect(MockPaymentGateway.pixCharge).toHaveBeenCalledWith({ amount: 5000 });
      expect(MockOrderModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ paymentStatus: 'pending', pixTxid: 'pix_1', pixQrcode: '000201010212' })
      );
      expect(MockPaymentGateway.record).toHaveBeenCalledWith(
        expect.objectContaining({ operation: 'pix_charge', gateway: 'PIX' })
      );
      expect(result.pixQrcode).toBe('000201010212');
    });
  });

  describe('getById', () => {
    function mockFindByIdChain(value: any) {
      const chain = {
        populate: jest.fn().mockReturnThis(),
        then: (resolve: (v: any) => void) => resolve(value),
      };
      MockOrderModel.findById.mockReturnValue(chain as any);
    }

    it('should return an order by id', async () => {
      const mockOrder = { _id: 'order123', status: 'pending', company: { name: 'Test Co' } };
      mockFindByIdChain(mockOrder);

      const result = await orderService.getById('order123');

      expect(MockOrderModel.findById).toHaveBeenCalledWith('order123');
      expect(result._id).toBe('order123');
    });

    it('should throw AppError if order not found', async () => {
      mockFindByIdChain(null);

      await expect(orderService.getById('nonexistent')).rejects.toThrow(AppError);
      await expect(orderService.getById('nonexistent')).rejects.toThrow('Pedido não encontrado');
    });
  });

  describe('list', () => {
    it('should return paginated orders', async () => {
      const mockOrders = [{ _id: '1' }, { _id: '2' }];
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockOrders),
      };

      MockOrderModel.find.mockReturnValue(mockChain as any);
      MockOrderModel.countDocuments.mockResolvedValue(2);

      const result = await orderService.list({ page: '1', limit: '10' });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pages).toBe(1);
    });

    it('should default to page 1 and limit 10', async () => {
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([]),
      };

      MockOrderModel.find.mockReturnValue(mockChain as any);
      MockOrderModel.countDocuments.mockResolvedValue(0);

      const result = await orderService.list({});

      expect(result.page).toBe(1);
      expect(mockChain.limit).toHaveBeenCalledWith(10);
    });

    it('should filter by status', async () => {
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([]),
      };

      MockOrderModel.find.mockReturnValue(mockChain as any);
      MockOrderModel.countDocuments.mockResolvedValue(0);

      await orderService.list({ status: 'pending' });

      expect(MockOrderModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'pending' })
      );
    });
  });

  describe('updateStatus', () => {
    it('should update order status with valid transition', async () => {
      const mockOrder = { _id: 'order123', status: 'ready' };
      MockOrderModel.findById.mockResolvedValue(mockOrder as any);
      MockOrderModel.findByIdAndUpdate.mockResolvedValue({ _id: 'order123', status: 'delivering' } as any);

      const result = await orderService.updateStatus('order123', 'delivering', 'deliveryman123');

      expect(result!.status).toBe('delivering');
    });

    it('should throw on invalid transition', async () => {
      const mockOrder = { _id: 'order123', status: 'pending' };
      MockOrderModel.findById.mockResolvedValue(mockOrder as any);

      await expect(orderService.updateStatus('order123', 'delivered')).rejects.toThrow('Transição de status inválida');
    });

    it('should require deliverymanId when transitioning to delivering', async () => {
      const mockOrder = { _id: 'order123', status: 'ready' };
      MockOrderModel.findById.mockResolvedValue(mockOrder as any);

      await expect(orderService.updateStatus('order123', 'delivering')).rejects.toThrow('deliverymanId é obrigatório');
    });

    it('should throw if order not found', async () => {
      MockOrderModel.findById.mockResolvedValue(null);

      await expect(orderService.updateStatus('nonexistent', 'delivered')).rejects.toThrow(AppError);
    });
  });

  describe('cancel', () => {
    it('should cancel a pending order', async () => {
      const mockOrder = { _id: 'order123', status: 'pending', save: jest.fn() };
      MockOrderModel.findById.mockResolvedValue(mockOrder as any);

      const result = await orderService.cancel('order123');

      expect(result.status).toBe('cancelled');
      expect(mockOrder.save).toHaveBeenCalled();
    });

    it('should throw if order already cancelled', async () => {
      const mockOrder = { _id: 'order123', status: 'cancelled' };
      MockOrderModel.findById.mockResolvedValue(mockOrder as any);

      await expect(orderService.cancel('order123')).rejects.toThrow('Pedido já está cancelado');
    });

    it('should throw if order already delivered', async () => {
      const mockOrder = { _id: 'order123', status: 'delivered' };
      MockOrderModel.findById.mockResolvedValue(mockOrder as any);

      await expect(orderService.cancel('order123')).rejects.toThrow('Não é possível cancelar pedido já entregue');
    });

    it('should throw if order not found', async () => {
      MockOrderModel.findById.mockResolvedValue(null);

      await expect(orderService.cancel('nonexistent')).rejects.toThrow('Pedido não encontrado');
    });
  });
});
