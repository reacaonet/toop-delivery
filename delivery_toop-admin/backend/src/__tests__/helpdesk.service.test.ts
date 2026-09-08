import { AppError } from '../middleware/errorHandler';

jest.mock('../models/HelpTicket', () => ({
  HelpTicketModel: {
    create: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.mock('../models/TicketInteraction', () => ({
  TicketInteractionModel: {
    create: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

jest.mock('../models/Faq', () => ({
  FaqModel: {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

import { HelpTicketModel } from '../models/HelpTicket';
import { TicketInteractionModel } from '../models/TicketInteraction';
import { FaqModel } from '../models/Faq';
import helpdeskService from '../services/helpdesk.service';

const MockTicket = HelpTicketModel as jest.Mocked<typeof HelpTicketModel>;
const MockInteraction = TicketInteractionModel as jest.Mocked<typeof TicketInteractionModel>;
const MockFaq = FaqModel as jest.Mocked<typeof FaqModel>;

function populateChain(value: any) {
  const chain = {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(value),
    then: (resolve: (v: any) => void) => resolve(value),
  };
  return chain;
}

describe('HelpDeskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTicket', () => {
    it('cria interação inicial automática com origin user quando há nome', async () => {
      const ticket = { _id: 't1', tickedId: 'TKT1', name: 'Cliente', description: 'ajuda' };
      MockTicket.create.mockResolvedValue(ticket as any);
      MockTicket.findById.mockReturnValue(populateChain(ticket as any) as any);
      MockInteraction.create.mockResolvedValue({} as any);

      const result = await helpdeskService.createTicket({ tickedId: 'TKT1', name: 'Cliente', description: 'ajuda' });

      expect(MockInteraction.create).toHaveBeenCalledWith(expect.objectContaining({
        helpTicketsId: 't1',
        origin: 'user',
        author: 'Cliente',
        description: 'ajuda',
      }));
      expect(result.tickedId).toBe('TKT1');
    });

    it('usa origin company quando não há nome', async () => {
      const ticket = { _id: 't2', tickedId: 'TKT2', description: 'x' };
      MockTicket.create.mockResolvedValue(ticket as any);
      MockTicket.findById.mockReturnValue(populateChain(ticket as any) as any);
      MockInteraction.create.mockResolvedValue({} as any);

      await helpdeskService.createTicket({ tickedId: 'TKT2', description: 'x' });

      expect(MockInteraction.create).toHaveBeenCalledWith(expect.objectContaining({ origin: 'company' }));
    });
  });

  describe('listTickets', () => {
    it('retorna shape paginado e exclui soft-deleted', async () => {
      MockTicket.find.mockReturnValue(populateChain([{ _id: '1' }, { _id: '2' }]) as any);
      MockTicket.countDocuments.mockResolvedValue(2);

      const result = await helpdeskService.listTickets({ page: '1', limit: '10' });

      expect(MockTicket.find).toHaveBeenCalledWith({ deletedAt: { $exists: false } });
      expect(result).toEqual({ data: [{ _id: '1' }, { _id: '2' }], total: 2, page: 1, pages: 1 });
    });

    it('monta busca q sobre tickedId/subject/name/email', async () => {
      MockTicket.find.mockReturnValue(populateChain([]) as any);
      MockTicket.countDocuments.mockResolvedValue(0);

      await helpdeskService.listTickets({ q: 'joao' });

      const filter = ((MockTicket.find as jest.Mock).mock.calls[0]![0] as any).$or;
      expect(filter).toBeInstanceOf(Array);
      expect(filter.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('getTicketByProtocol', () => {
    it('lança 404 quando protocolo não existe', async () => {
      MockTicket.findOne.mockReturnValue(populateChain(null) as any);

      await expect(helpdeskService.getTicketByProtocol('NAOEXISTE')).rejects.toThrow('Protocolo não encontrado');
    });

    it('retorna ticket com interações', async () => {
      const doc = { _id: 't1', tickedId: 'TKT1', toObject: () => ({ _id: 't1', tickedId: 'TKT1', __v: 0 }) };
      const interactions = [{ _id: 'i1', description: 'ola' }];
      const chain = {
        populate: jest.fn().mockReturnThis(),
        then: (resolve: (v: any) => void) => resolve(doc as any),
      };
      MockTicket.findOne.mockReturnValue(chain as any);
      MockInteraction.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(interactions) } as any);

      const result = await helpdeskService.getTicketByProtocol('TKT1');

      expect(result.interactions).toEqual(interactions);
      expect((result as any).__v).toBeUndefined();
    });
  });

  describe('updateTicket / deleteTicket', () => {
    it('update lança 404 quando não encontrado', async () => {
      MockTicket.findByIdAndUpdate.mockResolvedValue(null);

      await expect(helpdeskService.updateTicket('t1', { status: 'SOLVED' })).rejects.toThrow('Ticket não encontrado');
    });

    it('delete soft seta deletedAt', async () => {
      MockTicket.findByIdAndUpdate.mockResolvedValue({ _id: 't1', deletedAt: new Date() });

      const result = await helpdeskService.deleteTicket('t1');

      expect(MockTicket.findByIdAndUpdate).toHaveBeenCalledWith('t1', { deletedAt: expect.any(Date) }, { new: true });
      expect(result.deletedAt).toBeDefined();
    });
  });

  describe('FAQ', () => {
    it('createFaq normaliza status vazio para false', async () => {
      MockFaq.create.mockImplementation(async (d: any) => ({ _id: 'f1', ...d }));

      await helpdeskService.createFaq({ title: 'T', caption: 'C', description: 'D', status: '' });

      const passed = MockFaq.create.mock.calls[0][0] as any;
      expect(passed.status).toBe(false);
    });

    it('createFaq mantém status true', async () => {
      MockFaq.create.mockImplementation(async (d: any) => ({ _id: 'f1', ...d }));

      const result = await helpdeskService.createFaq({ title: 'T', caption: 'C', description: 'D', status: true });

      expect(result.status).toBe(true);
    });

    it('deleteFaq faz hard delete', async () => {
      MockFaq.findByIdAndDelete.mockResolvedValue({ _id: 'f1' });

      const result = await helpdeskService.deleteFaq('f1');

      expect(MockFaq.findByIdAndDelete).toHaveBeenCalledWith('f1');
      expect(result._id).toBe('f1');
    });

    it('getFaq lança 404 quando não existe', async () => {
      MockFaq.findById.mockResolvedValue(null);

      await expect(helpdeskService.getFaq('x')).rejects.toThrow(AppError);
      await expect(helpdeskService.getFaq('x')).rejects.toThrow('FAQ não encontrada');
    });
  });
});