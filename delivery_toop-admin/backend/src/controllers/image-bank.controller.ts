import { Request, Response, NextFunction } from 'express';
import imageBankService from '../services/image-bank.service';

export class ImageBankController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await imageBankService.list(req.params.barcode, parseInt(req.params.pageIn, 10), parseInt(req.params.size, 10)));
    } catch (e) { next(e); }
  };

  listPorNome = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await imageBankService.listPorNome(req.params.nome, parseInt(req.params.pageIn, 10), parseInt(req.params.size, 10)));
    } catch (e) { next(e); }
  };

  listPorCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await imageBankService.listPorCategory(req.params.category, parseInt(req.params.pageIn, 10), parseInt(req.params.size, 10)));
    } catch (e) { next(e); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await imageBankService.create(req.body)); } catch (e) { next(e); }
  };

  register = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await imageBankService.register(req.body)); } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await imageBankService.update(req.params.id, req.body)); } catch (e) { next(e); }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await imageBankService.remove(req.params.id)); } catch (e) { next(e); }
  };
}

export default new ImageBankController();
