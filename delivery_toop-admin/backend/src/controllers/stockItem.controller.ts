import { Request, Response } from 'express';
import stockItemService from '../services/stockItem.service';

export class StockItemController {
  async create(req: Request, res: Response) {
    try {
      const item = await stockItemService.create(req.body);
      res.status(201).json({ success: true, data: item });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const item = await stockItemService.getById(req.params.id);
      if (!item) return res.status(404).json({ success: false, error: 'Item não encontrado' });
      res.json({ success: true, data: item });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async listByCompany(req: Request, res: Response) {
    try {
      const { search } = req.query;
      const items = await stockItemService.listByCompany(req.params.companyId, search as string);
      res.json({ success: true, data: items });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const item = await stockItemService.update(req.params.id, req.body);
      if (!item) return res.status(404).json({ success: false, error: 'Item não encontrado' });
      res.json({ success: true, data: item });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const item = await stockItemService.delete(req.params.id);
      if (!item) return res.status(404).json({ success: false, error: 'Item não encontrado' });
      res.json({ success: true, data: item });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export default new StockItemController();
