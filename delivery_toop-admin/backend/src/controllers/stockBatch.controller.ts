import { Request, Response } from 'express';
import stockBatchService from '../services/stockBatch.service';

export class StockBatchController {
  async create(req: Request, res: Response) {
    try {
      const batch = await stockBatchService.create(req.body);
      res.status(201).json({ success: true, data: batch });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const batch = await stockBatchService.getById(req.params.id);
      if (!batch) return res.status(404).json({ success: false, error: 'Lote não encontrado' });
      res.json({ success: true, data: batch });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async listByBranch(req: Request, res: Response) {
    try {
      const { stockItemId } = req.query;
      const batches = await stockBatchService.listByBranch(
        req.params.branchId,
        stockItemId as string
      );
      res.json({ success: true, data: batches });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async listByCompany(req: Request, res: Response) {
    try {
      const batches = await stockBatchService.listByCompany(req.params.companyId);
      res.json({ success: true, data: batches });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const batch = await stockBatchService.update(req.params.id, req.body);
      if (!batch) return res.status(404).json({ success: false, error: 'Lote não encontrado' });
      res.json({ success: true, data: batch });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getLowStock(req: Request, res: Response) {
    try {
      const alerts = await stockBatchService.getLowStock(req.params.companyId);
      res.json({ success: true, data: alerts });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export default new StockBatchController();
