import { Request, Response, NextFunction } from "express";
import helpdeskService from "../services/helpdesk.service";

export class HelpDeskController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  // ---------- Tickets ----------
  createTicket = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await helpdeskService.createTicket(req.body), 201); } catch (e) { next(e); }
  };
  listTickets = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await helpdeskService.listTickets(req.query as any)); } catch (e) { next(e); }
  };
  getTicket = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await helpdeskService.getTicket(req.params.id)); } catch (e) { next(e); }
  };
  getTicketByProtocol = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await helpdeskService.getTicketByProtocol(req.params.protocol)); } catch (e) { next(e); }
  };
  updateTicket = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await helpdeskService.updateTicket(req.params.id, req.body)); } catch (e) { next(e); }
  };
  deleteTicket = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await helpdeskService.deleteTicket(req.params.id)); } catch (e) { next(e); }
  };

  // ---------- Interactions ----------
  listTicketInteractions = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await helpdeskService.listTicketInteractions(req.params.ticket_id)); } catch (e) { next(e); }
  };
  createInteraction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: any = { ...req.body };
      if (req.params.ticket_id) data.helpTicketsId = req.params.ticket_id;
      this.ok(res, await helpdeskService.createInteraction(data), 201);
    } catch (e) { next(e); }
  };
  updateInteraction = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await helpdeskService.updateInteraction(req.params.id, req.body)); } catch (e) { next(e); }
  };
  deleteInteraction = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await helpdeskService.deleteInteraction(req.params.id)); } catch (e) { next(e); }
  };

  // ---------- FAQ ----------
  listFaqs = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await helpdeskService.listFaqs(req.query as any)); } catch (e) { next(e); }
  };
  getFaq = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await helpdeskService.getFaq(req.params.id)); } catch (e) { next(e); }
  };
  createFaq = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await helpdeskService.createFaq(req.body), 201); } catch (e) { next(e); }
  };
  updateFaq = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await helpdeskService.updateFaq(req.params.id, req.body)); } catch (e) { next(e); }
  };
  deleteFaq = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await helpdeskService.deleteFaq(req.params.id)); } catch (e) { next(e); }
  };
}

export default new HelpDeskController();
