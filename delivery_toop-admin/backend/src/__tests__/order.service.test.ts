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

import { OrderModel } from '../models/Order';
import orderService from '../services/order.service';

const MockOrderModel = OrderModel as jest.Mocked<typeof OrderModel>;

describe('OrderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order with generated orderNumber', async () => {
      const orderData = {
        company: 'company123',
        customer: 'customer123',
        items: [{ name: 'Pizza', quantity: 1, price: 45.0, total: 45.0 }],
        subtotal: 45.0,
        total: 50.0,
        paymentMethod: 'credit_card',
        deliveryAddress: { street: 'Rua Teste', number: '123', city: 'Sao Paulo', state: 'SP' },
      };

      const mockOrder = { _id: 'order123', ...orderData, orderNumber: '123456001', status: 'pending' };
      MockOrderModel.create.mockResolvedValue(mockOrder as any);

      const result = await orderService.create(orderData);

      expect(MockOrderModel.create).toHaveBeenCalledTimes(1);
      expect(result.orderNumber).toBeDefined();
      expect(result.status).toBe('pending');
    });
  });

  describe('getById', () => {
    it('should return an order by id', async () => {
      const mockOrder = { _id: 'order123', status: 'pending', company: { name: 'Test Co' } };
      MockOrderModel.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockOrder) } as any);

      const result = await orderService.getById('order123');

      expect(MockOrderModel.findById).toHaveBeenCalledWith('order123');
      expect(result._id).toBe('order123');
    });

    it('should throw AppError if order not found', async () => {
      MockOrderModel.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) } as any);

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
