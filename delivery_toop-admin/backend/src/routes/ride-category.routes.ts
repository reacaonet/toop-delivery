import { Router } from "express";
import rideCategoryService from "../services/ride-category.service";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const data = await rideCategoryService.list({
      all: req.query.all === "true" || req.query.all === "1",
      vehicleType: typeof req.query.vehicleType === "string" ? req.query.vehicleType : undefined,
    });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const data = await rideCategoryService.create(req.body);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", authenticate, async (req, res, next) => {
  try {
    const data = await rideCategoryService.update(req.params.id, req.body);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const data = await rideCategoryService.remove(req.params.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;