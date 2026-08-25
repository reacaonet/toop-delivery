import { Request, Response } from 'express';
import branchService from '../services/branch.service';

export class BranchController {
  async create(req: Request, res: Response) {
    try {
      const branch = await branchService.create(req.body);
      res.status(201).json({ success: true, data: branch });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const branch = await branchService.getById(req.params.id);
      if (!branch) return res.status(404).json({ success: false, error: 'Filial não encontrada' });
      res.json({ success: true, data: branch });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async listByCompany(req: Request, res: Response) {
    try {
      const branches = await branchService.listByCompany(req.params.companyId);
      res.json({ success: true, data: branches });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const branch = await branchService.update(req.params.id, req.body);
      if (!branch) return res.status(404).json({ success: false, error: 'Filial não encontrada' });
      res.json({ success: true, data: branch });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const branch = await branchService.delete(req.params.id);
      if (!branch) return res.status(404).json({ success: false, error: 'Filial não encontrada' });
      res.json({ success: true, data: branch });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export default new BranchController();
