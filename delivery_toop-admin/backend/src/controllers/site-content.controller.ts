import { Request, Response, NextFunction } from 'express';
import siteContentService from '../services/site-content.service';

export class SiteContentController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  // SLIDER
  sliderRegister = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await siteContentService.sliderRegister(req.body), 201); } catch (e) { next(e); }
  };

  sliderCreate = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await siteContentService.sliderCreate(req.body), 201); } catch (e) { next(e); }
  };

  sliderList = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await siteContentService.sliderList(req.query as any, [])); } catch (e) { next(e); }
  };

  sliderPaginator = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await siteContentService.sliderPaginator(req.query, req.user?._id)); } catch (e) { next(e); }
  };

  sliderUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await siteContentService.sliderUpdate(req.params.id, req.body)); } catch (e) { next(e); }
  };

  sliderRemove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await siteContentService.sliderRemove(req.params.id)); } catch (e) { next(e); }
  };

  // TABLOID
  tabloidRegister = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await siteContentService.tabloidRegister(req.body), 201); } catch (e) { next(e); }
  };

  tabloidCreate = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await siteContentService.tabloidCreate(req.body), 201); } catch (e) { next(e); }
  };

  tabloidList = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await siteContentService.tabloidList()); } catch (e) { next(e); }
  };

  tabloidUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await siteContentService.tabloidUpdate(req.params.id, req.body)); } catch (e) { next(e); }
  };

  tabloidRemove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await siteContentService.tabloidRemove(req.params.id)); } catch (e) { next(e); }
  };

  // TIP
  tipCreate = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await siteContentService.tipCreate(req.body), 201); } catch (e) { next(e); }
  };

  tipList = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await siteContentService.tipList()); } catch (e) { next(e); }
  };

  tipSearch = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await siteContentService.tipSearch(req.query as any)); } catch (e) { next(e); }
  };

  tipRemove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await siteContentService.tipRemove(req.params.id)); } catch (e) { next(e); }
  };

  // TIP DELIVERYMAN
  tipDeliveryManCreate = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await siteContentService.tipDeliveryManCreate(req.body), 201); } catch (e) { next(e); }
  };

  tipDeliveryManList = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await siteContentService.tipDeliveryManList()); } catch (e) { next(e); }
  };

  tipDeliveryManRemove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await siteContentService.tipDeliveryManRemove(req.params.id)); } catch (e) { next(e); }
  };

  // SITE
  siteCreate = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await siteContentService.siteCreate(req.body), 201); } catch (e) { next(e); }
  };

  siteList = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await siteContentService.siteList()); } catch (e) { next(e); }
  };

  sitePaginator = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await siteContentService.sitePaginator(req.query, req.user?._id)); } catch (e) { next(e); }
  };

  siteUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await siteContentService.siteUpdate(req.params.id, req.body)); } catch (e) { next(e); }
  };

  siteRemove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await siteContentService.siteRemove(req.params.id)); } catch (e) { next(e); }
  };
}

export default new SiteContentController();
