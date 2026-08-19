import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { uploadSingle, uploadMultiple } from "../middleware/upload";

const router = Router();

router.post("/single", authenticate, (req: Request, res: Response) => {
  uploadSingle('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: "Nenhum arquivo enviado" });
    }
    const url = `/uploads/${req.file.filename}`;
    return res.status(200).json({ success: true, data: { url, filename: req.file.filename } });
  });
});

router.post("/multiple", authenticate, (req: Request, res: Response) => {
  uploadMultiple('files', 10)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ success: false, error: "Nenhum arquivo enviado" });
    }
    const files = (req.files as Express.Multer.File[]).map(f => ({
      url: `/uploads/${f.filename}`,
      filename: f.filename,
    }));
    return res.status(200).json({ success: true, data: files });
  });
});

export default router;
