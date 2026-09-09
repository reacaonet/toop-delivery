import { Request, Response, NextFunction } from "express";
import toolsService from "../services/tools.service";
import axios from "axios";
import path from "path";
import fs from "fs";
import { env } from "../config";
import { AppError } from "../middleware/errorHandler";

export class ToolsController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  // Popup
  listPopup = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.listPopup()); } catch (e) { next(e); }
  };
  paginatorPopup = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.paginatorPopup(req.query as any)); } catch (e) { next(e); }
  };
  createPopup = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.createPopup(req.body), 201); } catch (e) { next(e); }
  };
  updatePopup = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.updatePopup(req.params.id, req.body)); } catch (e) { next(e); }
  };
  removePopup = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.removePopup(req.params.id)); } catch (e) { next(e); }
  };
  updatePopupViews = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.updatePopupViews(req.params.id, req.body)); } catch (e) { next(e); }
  };
  listPopupApp = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.listPopupApp(req.params.id)); } catch (e) { next(e); }
  };

  // Integration
  listIntegrations = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.listIntegrations(req.query as any)); } catch (e) { next(e); }
  };
  listIntegrationByCompany = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.listIntegrationByCompany(req.params.company)); } catch (e) { next(e); }
  };
  createIntegration = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.createIntegration(req.body), 201); } catch (e) { next(e); }
  };
  updateIntegration = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.updateIntegration(req.params.id, req.body)); } catch (e) { next(e); }
  };
  removeIntegration = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.removeIntegration(req.params.id)); } catch (e) { next(e); }
  };
  paginatorIntegration = async (req: Request, res: Response, next: NextFunction) => {
    try { this.ok(res, await toolsService.paginatorIntegration(req.query as any)); } catch (e) { next(e); }
  };

  // ---------- 1.16 Compressão de imagem ----------
  compressImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = (req as any).file;
      if (!file || !file.path) {
        throw new AppError("Envie uma imagem (campo 'file') para comprimir", 400);
      }

      const quality = Math.min(100, Math.max(1, Number(req.query.quality || 75)));
      const inputPath = file.path;
      const webpPath = inputPath.replace(/\.[^.]+$/, "") + "-compressed.webp";

      let sharpMod: any = null;
      try {
        sharpMod = (await import("sharp")).default;
      } catch (_e) {
        sharpMod = null;
      }

      const originalSize = fs.statSync(inputPath).size;

      if (!sharpMod) {
        return res.status(200).json({
          success: true,
          data: {
            original: inputPath,
            size: originalSize,
            compressed: null,
            degraded: true,
            warning:
              "Biblioteca 'sharp' não instalada neste ambiente (npm install) — o arquivo original foi mantido",
          },
        });
      }

      const meta = await sharpMod(inputPath).metadata();
      await sharpMod(inputPath)
        .rotate()
        .resize({ width: Number(req.query.width) || undefined, height: Number(req.query.height) || undefined, fit: "inside", withoutEnlargement: true })
        .webp({ quality })
        .toFile(webpPath);

      const compressedSize = fs.statSync(webpPath).size;

      return res.status(200).json({
        success: true,
        data: {
          original: inputPath,
          compressed: webpPath,
          width: meta.width,
          height: meta.height,
          format: meta.format,
          originalSize,
          compressedSize,
          savedBytes: Math.max(0, originalSize - compressedSize),
          savingsPct: originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 10000) / 100 : 0,
          degraded: false,
        },
      });
    } catch (e) {
      next(e);
    }
  };

  // ---------- 1.16 Sincronização de imagem de produto ----------
  syncImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { imageUrl } = req.body || {};
      if (!imageUrl || typeof imageUrl !== "string") {
        throw new AppError("Informe imageUrl para sincronizar a imagem do produto", 400);
      }

      if (!env.PRODUCT_IMAGE_API) {
        throw new AppError(
          "PRODUCT_IMAGE_API não configurada: informe a base URL da API de imagens (produto) no ambiente",
          400
        );
      }

      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const target = imageUrl.startsWith("http") ? imageUrl : `${env.PRODUCT_IMAGE_API.replace(/\/$/, "")}/${imageUrl.replace(/^\//, "")}`;
      const { data: buffer, headers } = await axios.get(target, { responseType: "arraybuffer", timeout: 30000 });

      const fileName = `sync-${Date.now()}-${Math.round(Math.random() * 1e9)}.${(imageUrl.split(".").pop() || "jpg").toLowerCase()}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, buffer);

      return res.status(200).json({
        success: true,
        data: {
          file: filePath,
          source: target,
          bytes: buffer.byteLength,
          contentType: headers["content-type"] || null,
          degraded: false,
        },
      });
    } catch (e) {
      next(e);
    }
  };
}

export default new ToolsController();
