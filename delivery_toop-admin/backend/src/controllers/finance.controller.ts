import { Request, Response, NextFunction } from "express";
import financeService from "../services/finance.service";

export class FinanceController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  // ---------- Cost Center ----------
  createCostCenter = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.createCostCenter(req.body), 201); } catch (e) { next(e); }
  };
  listCostCenters = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.listCostCenters(req.query as any)); } catch (e) { next(e); }
  };
  getCostCenter = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.getCostCenter(req.params.id)); } catch (e) { next(e); }
  };
  updateCostCenter = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.updateCostCenter(req.params.id, req.body)); } catch (e) { next(e); }
  };
  deleteCostCenter = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.deleteCostCenter(req.params.id)); } catch (e) { next(e); }
  };

  // ---------- Type Payment ----------
  createTypePayment = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.createTypePayment(req.body), 201); } catch (e) { next(e); }
  };
  listTypePayments = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.listTypePayments(req.query as any)); } catch (e) { next(e); }
  };
  getTypePayment = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.getTypePayment(req.params.id)); } catch (e) { next(e); }
  };
  updateTypePayment = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.updateTypePayment(req.params.id, req.body)); } catch (e) { next(e); }
  };
  deleteTypePayment = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.deleteTypePayment(req.params.id)); } catch (e) { next(e); }
  };

  // ---------- Bank ----------
  createBank = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.createBank(req.body), 201); } catch (e) { next(e); }
  };
  listBanks = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.listBanks(req.query as any)); } catch (e) { next(e); }
  };
  getBank = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.getBank(req.params.id)); } catch (e) { next(e); }
  };
  updateBank = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.updateBank(req.params.id, req.body)); } catch (e) { next(e); }
  };
  deleteBank = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.deleteBank(req.params.id)); } catch (e) { next(e); }
  };

  // ---------- Agency ----------
  createAgency = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.createAgency(req.body), 201); } catch (e) { next(e); }
  };
  listAgencies = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.listAgencies(req.query as any)); } catch (e) { next(e); }
  };
  getAgency = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.getAgency(req.params.id)); } catch (e) { next(e); }
  };
  updateAgency = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.updateAgency(req.params.id, req.body)); } catch (e) { next(e); }
  };
  deleteAgency = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.deleteAgency(req.params.id)); } catch (e) { next(e); }
  };

  // ---------- Digital Account ----------
  createDigitalAccount = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.createDigitalAccount(req.body), 201); } catch (e) { next(e); }
  };
  listDigitalAccounts = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.listDigitalAccounts(req.query as any)); } catch (e) { next(e); }
  };
  getDigitalAccount = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.getDigitalAccount(req.params.id)); } catch (e) { next(e); }
  };
  getDigitalAccountBalance = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.getDigitalAccountBalance(req.params.id)); } catch (e) { next(e); }
  };
  updateDigitalAccount = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.updateDigitalAccount(req.params.id, req.body)); } catch (e) { next(e); }
  };
  deleteDigitalAccount = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.deleteDigitalAccount(req.params.id)); } catch (e) { next(e); }
  };
  moveDigitalAccount = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.moveDigitalAccount(req.params.id, req.body)); } catch (e) { next(e); }
  };

  // ---------- Chargeback ----------
  createChargeback = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.createChargeback(req.body), 201); } catch (e) { next(e); }
  };
  listChargebacks = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.listChargebacks(req.query as any)); } catch (e) { next(e); }
  };
  getChargeback = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.getChargeback(req.params.id)); } catch (e) { next(e); }
  };
  updateChargeback = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.updateChargeback(req.params.id, req.body)); } catch (e) { next(e); }
  };
  deleteChargeback = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.deleteChargeback(req.params.id)); } catch (e) { next(e); }
  };

  // ---------- Balances ----------
  listBalances = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.listBalances(req.query as any)); } catch (e) { next(e); }
  };
  getCompanyBalance = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await financeService.getCompanyBalance(req.params.id, req.query as any)); } catch (e) { next(e); }
  };
}

export default new FinanceController();
