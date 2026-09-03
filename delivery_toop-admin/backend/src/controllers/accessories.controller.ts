import { Request, Response, NextFunction } from "express";
import accessoriesService from "../services/accessories.service";

export class AccessoriesController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  /* Category */
  categoryByCompany = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessoriesService.categoryByCompany(String(req.query.company || ''))); } catch (e) { next(e); }
  };
  categoryListByName = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessoriesService.categoryListByName(String(req.query.listByName || ''))); } catch (e) { next(e); }
  };
  categoryCreate = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessoriesService.categoryCreate(req.body), 201); } catch (e) { next(e); }
  };
  categoryUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessoriesService.categoryUpdate(req.params.id, req.body)); } catch (e) { next(e); }
  };
  categoryRemove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessoriesService.categoryRemove(req.params.id)); } catch (e) { next(e); }
  };

  /* Product */
  productListGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const company = String(req.query.company || '');
      const appVersion = req.header('appVersion') as string | undefined;
      this.ok(res, await accessoriesService.productListGroupCategory(company, appVersion));
    } catch (e) { next(e); }
  };
  productList = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessoriesService.productList(req.query as any)); } catch (e) { next(e); }
  };
  productGet = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessoriesService.productGet(req.params.id)); } catch (e) { next(e); }
  };
  productCreate = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessoriesService.productCreate(req.body), 201); } catch (e) { next(e); }
  };
  productUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessoriesService.productUpdate(req.params.id, req.body)); } catch (e) { next(e); }
  };
  productSort = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessoriesService.productSort(req.body)); } catch (e) { next(e); }
  };
  productRemove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessoriesService.productRemove(req.params.id)); } catch (e) { next(e); }
  };

  /* Product Complement */
  complementList = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessoriesService.complementList(req.params.productId)); } catch (e) { next(e); }
  };
  complementCreate = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessoriesService.complementCreate(req.body), 201); } catch (e) { next(e); }
  };

  /* Complement Item */
  itemList = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessoriesService.itemList()); } catch (e) { next(e); }
  };
  itemCreate = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessoriesService.itemCreate(req.body), 201); } catch (e) { next(e); }
  };
  itemUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessoriesService.itemUpdate(req.params.id, req.body)); } catch (e) { next(e); }
  };
  itemRemove = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await accessoriesService.itemRemove(req.params.id)); } catch (e) { next(e); }
  };
}

export default new AccessoriesController();
