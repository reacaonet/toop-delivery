import { AppError } from '../middleware/errorHandler';

jest.mock('../models/Campaign', () => ({
  CampaignModel: {
    find: jest.fn(),
    countDocuments: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));

import { CampaignModel } from '../models/Campaign';
import marketingService from '../services/marketing.service';

const MockCampaign = CampaignModel as jest.Mocked<typeof CampaignModel>;

function findChain(value: any) {
  const chain = {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(value),
  };
  return chain;
}

describe('MarketingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listCampaigns', () => {
    it('filtra soft-deleted e retorna shape paginado {data,total,page,pages}', async () => {
      MockCampaign.find.mockReturnValue(findChain([{ name: 'A' }, { name: 'B' }]) as any);
      MockCampaign.countDocuments.mockResolvedValue(2);

      const result = await marketingService.listCampaigns({ page: '1', limit: '10' });

      expect(MockCampaign.find).toHaveBeenCalledWith({ deletedAt: { $exists: false } });
      expect(result).toEqual({ data: [{ name: 'A' }, { name: 'B' }], total: 2, page: 1, pages: 1 });
    });

    it('usa defaults page 1 / limit 50 e ordena por createdAt desc', async () => {
      MockCampaign.find.mockReturnValue(findChain([]) as any);
      MockCampaign.countDocuments.mockResolvedValue(0);

      const result = await marketingService.listCampaigns({});

      expect(result.page).toBe(1);
      expect(result.pages).toBe(0);
    });
  });

  describe('getCampaign', () => {
    it('lança AppError 404 quando não encontrada', async () => {
      MockCampaign.findOne.mockResolvedValue(null);

      await expect(marketingService.getCampaign('abc')).rejects.toThrow(AppError);
      await expect(marketingService.getCampaign('abc')).rejects.toThrow('Campanha não encontrada');
    });

    it('busca excluindo soft-deleted', async () => {
      MockCampaign.findOne.mockResolvedValue({ _id: '1', name: 'A' });

      const result = await marketingService.getCampaign('1');

      expect(MockCampaign.findOne).toHaveBeenCalledWith({ _id: '1', deletedAt: { $exists: false } });
      expect(result.name).toBe('A');
    });
  });

  describe('createCampaign', () => {
    it('cria com os dados enviados', async () => {
      const data = { name: 'Camp', disseminationVehicle: 'app' };
      MockCampaign.create.mockResolvedValue({ _id: 'c1', ...data } as any);

      const result = await marketingService.createCampaign(data);

      expect(MockCampaign.create).toHaveBeenCalledWith(data);
      expect(result._id).toBe('c1');
    });
  });

  describe('updateCampaign', () => {
    it('atualiza com filtro de soft-delete e retorna 404 se não achar', async () => {
      MockCampaign.findOneAndUpdate.mockResolvedValue(null);

      await expect(marketingService.updateCampaign('1', { note: 'x' })).rejects.toThrow('Campanha não encontrada');
      expect(MockCampaign.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: '1', deletedAt: { $exists: false } },
        { note: 'x' },
        { new: true, runValidators: true }
      );
    });
  });

  describe('deleteCampaign', () => {
    it('marca deletedAt em vez de hard delete', async () => {
      MockCampaign.findOneAndUpdate.mockResolvedValue({ _id: '1', deletedAt: new Date() });

      const result = await marketingService.deleteCampaign('1');

      expect(MockCampaign.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: '1', deletedAt: { $exists: false } },
        { deletedAt: expect.any(Date) },
        { new: true }
      );
      expect(result.deletedAt).toBeDefined();
    });

    it('lança 404 se a campanha não existe', async () => {
      MockCampaign.findOneAndUpdate.mockResolvedValue(null);

      await expect(marketingService.deleteCampaign('x')).rejects.toThrow(AppError);
    });
  });
});