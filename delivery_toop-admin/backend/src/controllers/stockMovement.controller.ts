import { Request, Response } from 'express';
import stockMovementService from '../services/stockMovement.service';

export class StockMovementController {
  async create(req: Request, res: Response) {
    try {
      const movement = await stockMovementService.create(req.body);
      res.status(201).json({ success: true, data: movement });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const movement = await stockMovementService.getById(req.params.id);
      if (!movement) return res.status(404).json({ success: false, error: 'Movimentação não encontrada' });
      res.json({ success: true, data: movement });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async listByBranch(req: Request, res: Response) {
    try {
      const { type, stockItemId, startDate, endDate } = req.query;
      const movements = await stockMovementService.listByBranch(req.params.branchId, {
        type: type as string,
        stockItemId: stockItemId as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      res.json({ success: true, data: movements });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async listByCompany(req: Request, res: Response) {
    try {
      const { type, startDate, endDate } = req.query;
      const movements = await stockMovementService.listByCompany(req.params.companyId, {
        type: type as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      res.json({ success: true, data: movements });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async registerEntry(req: Request, res: Response) {
    try {
      const result = await stockMovementService.registerEntry(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async registerExit(req: Request, res: Response) {
    try {
      const movements = await stockMovementService.registerExit(req.body);
      res.status(201).json({ success: true, data: movements });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getSummary(req: Request, res: Response) {
    try {
      const summary = await stockMovementService.getSummary(req.params.branchId);
      res.json({ success: true, data: summary });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export default new StockMovementController();
