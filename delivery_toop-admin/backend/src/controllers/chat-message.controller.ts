import { Request, Response, NextFunction } from 'express';
import chatMessageService from '../services/chat-message.service';

export class ChatMessageController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  listByCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await chatMessageService.listByCart(req.params.cartId));
    } catch (e) { next(e); }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await chatMessageService.list(req.query as any));
    } catch (e) { next(e); }
  };

  noRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await chatMessageService.noRead(req.params.cartId, req.query.personId as string));
    } catch (e) { next(e); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await chatMessageService.create(req.body), 201);
    } catch (e) { next(e); }
  };

  updateRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ok(res, await chatMessageService.updateRead(req.body));
    } catch (e) { next(e); }
  };
}

export default new ChatMessageController();
