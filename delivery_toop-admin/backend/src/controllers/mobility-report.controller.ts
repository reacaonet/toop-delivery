import { Request, Response, NextFunction } from 'express';
import mobilityReportService from '../services/mobility-report.service';

export class MobilityReportController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  admDriverReport = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await mobilityReportService.admDriverReport(req.query)); } catch (e) { next(e); }
  };

  admDriverBalance = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await mobilityReportService.admDriverBalance(req.query)); } catch (e) { next(e); }
  };

  admPassengerReport = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await mobilityReportService.admPassengerReport(req.query)); } catch (e) { next(e); }
  };

  admPassengerBalance = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await mobilityReportService.admPassengerBalance(req.query)); } catch (e) { next(e); }
  };

  admRacesReport = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await mobilityReportService.admRacesReport(req.query)); } catch (e) { next(e); }
  };

  admRacesBalance = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await mobilityReportService.admRacesBalance(req.query)); } catch (e) { next(e); }
  };

  driverPaginator = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await mobilityReportService.driverPaginator(req.query)); } catch (e) { next(e); }
  };

  mapMonitoring = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await mobilityReportService.mapMonitoring(req.query)); } catch (e) { next(e); }
  };

  activeMonitoring = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await mobilityReportService.activeMonitoring(req.query, req.user?._id)); } catch (e) { next(e); }
  };
}

export default new MobilityReportController();
