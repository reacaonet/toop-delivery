import { AppError } from '../middleware/errorHandler';

jest.mock('../models/CashbackCampaign', () => ({
  CashbackCampaignModel: {
    find: jest.fn(),
    countDocuments: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    aggregate: jest.fn(),
  },
}));

import { CashbackCampaignModel } from '../models/CashbackCampaign';
import cashbackService from '../services/cashback.service';

const MockCampaign = CashbackCampaignModel as jest.Mocked<typeof CashbackCampaignModel>;

const VALID_ID = '6a96d8fdc431c808cc189d05';

function findChain(value: any) {
  const chain = {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(value),
  };
  return chain;
}

describe('CashbackService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCampaign', () => {
    it('valida campos obrigatórios (name, percent, amount)', async () => {
      await expect(cashbackService.createCampaign({ percent: 10, amount: 100 })).rejects.toThrow('Informe um nome válido');
      await expect(cashbackService.createCampaign({ name: 'C', amount: 100 })).rejects.toThrow('Informe a % de cashback');
      await expect(cashbackService.createCampaign({ name: 'C', percent: 10 })).rejects.toThrow('Informe o valor provisionado para a campanha');
    });

    it('normaliza status string e define balance = amount', async () => {
      const data = { name: 'C', percent: '10', amount: 1000, status: 'false' };
      MockCampaign.create.mockImplementation(async (d: any) => ({ _id: 'c1', ...d }));

      await cashbackService.createCampaign(data as any);

      const passed = (MockCampaign.create.mock.calls[0]![0] as any);
      expect(passed.balance).toBe(1000);
      expect(passed.status).toBe(false);
    });

    it('remove _id e filtra companies vazias antes de criar', async () => {
      const data = { _id: 'legado', name: 'C', percent: 10, amount: 5, companies: ['', null, '6a96d8fdc431c808cc189d05'] };
      MockCampaign.create.mockImplementation(async (d: any) => ({ ...d }));

      await cashbackService.createCampaign(data as any);

      const passed = (MockCampaign.create.mock.calls[0]![0] as any);
      expect(passed._id).toBeUndefined();
      expect(passed.companies).toEqual(['6a96d8fdc431c808cc189d05']);
    });
  });

  describe('listCampaigns', () => {
    it('filtra por status true/false', async () => {
      MockCampaign.find.mockReturnValue(findChain([]) as any);
      MockCampaign.countDocuments.mockResolvedValue(0);

      await cashbackService.listCampaigns({ status: 'true' });
      expect(MockCampaign.find).toHaveBeenCalledWith(expect.objectContaining({ status: true }));

      await cashbackService.listCampaigns({ status: 'false' });
      expect(MockCampaign.find).toHaveBeenCalledWith(expect.objectContaining({ status: false }));
    });

    it('filtra por nome com regex case-insensitive', async () => {
      MockCampaign.find.mockReturnValue(findChain([]) as any);
      MockCampaign.countDocuments.mockResolvedValue(0);

      await cashbackService.listCampaigns({ name: 'CASH' });
      expect(MockCampaign.find).toHaveBeenCalledWith(
        expect.objectContaining({ name: { $regex: 'CASH', $options: 'i' } })
      );
    });

    it('retorna shape paginado', async () => {
      MockCampaign.find.mockReturnValue(findChain([{ name: 'A' }]) as any);
      MockCampaign.countDocuments.mockResolvedValue(1);

      const result = await cashbackService.listCampaigns({ page: '1', limit: '10' });

      expect(result).toEqual({ data: [{ name: 'A' }], total: 1, page: 1, pages: 1 });
    });
  });

  describe('getCampaign', () => {
    it('lança 400 para ObjectId inválido', async () => {
      await expect(cashbackService.getCampaign('abc')).rejects.toThrow(AppError);
      await expect(cashbackService.getCampaign('abc')).rejects.toThrow('Campanha inválida');
    });

    it('lança 404 quando não encontrada', async () => {
      MockCampaign.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) } as any);

      await expect(cashbackService.getCampaign(VALID_ID)).rejects.toThrow('Campanha não encontrada');
    });
  });

  describe('updateCampaign', () => {
    it('recalcula balance quando amount muda', async () => {
      (MockCampaign.findOneAndUpdate as jest.Mock).mockImplementation(async (_f: any, d: any) => ({ _id: 'c1', ...d }));

      await cashbackService.updateCampaign(VALID_ID, { amount: 2500 } as any);

      const passed = (MockCampaign.findOneAndUpdate.mock.calls[0]![1] as any);
      expect(passed.balance).toBe(2500);
      expect(MockCampaign.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: VALID_ID, deletedAt: { $exists: false } },
        passed,
        { new: true, runValidators: true }
      );
    });

    it('lança 400 para id inválido', async () => {
      await expect(cashbackService.updateCampaign('xyz', { name: 'C' })).rejects.toThrow('Campanha inválida');
    });
  });

  describe('deleteCampaign', () => {
    it('soft delete com deletedAt', async () => {
      MockCampaign.findOneAndUpdate.mockResolvedValue({ _id: VALID_ID, deletedAt: new Date() });

      const result = await cashbackService.deleteCampaign(VALID_ID);

      expect(result.deletedAt).toBeDefined();
    });

    it('lança 400 para ObjectId inválido e 404 quando não existe', async () => {
      await expect(cashbackService.deleteCampaign('nope')).rejects.toThrow('Campanha inválida');

      MockCampaign.findOneAndUpdate.mockResolvedValue(null);
      await expect(cashbackService.deleteCampaign(VALID_ID)).rejects.toThrow('Campanha não encontrada');
    });
  });
});