import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  classifyVehicle,
  RIDE_CATEGORY_LABELS,
  listVehicleCategoryRules,
  upsertVehicleCategoryRule,
  deleteVehicleCategoryRule,
  getVehicleCategoryOptions,
} from '../services/vehicle-category.service';

const router = Router();

router.get('/classify', (req, res, next) => {
  try {
    const result = classifyVehicle(req.query as any);
    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/options', async (req, res, next) => {
  try {
    const data = await getVehicleCategoryOptions(req.query.brand as string | undefined);
    return res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/rules', async (req, res, next) => {
  try {
    const rules = await listVehicleCategoryRules();
    return res.json({ success: true, data: { labels: RIDE_CATEGORY_LABELS, rules } });
  } catch (error) {
    next(error);
  }
});

router.post('/rules', authenticate, async (req, res, next) => {
  try {
    const rule = await upsertVehicleCategoryRule(req.body);
    return res.json({ success: true, data: rule });
  } catch (error) {
    next(error);
  }
});

router.put('/rules/:id', authenticate, async (req, res, next) => {
  try {
    const rule = await upsertVehicleCategoryRule({ ...req.body, _id: req.params.id });
    return res.json({ success: true, data: rule });
  } catch (error) {
    next(error);
  }
});

router.delete('/rules/:id', authenticate, async (req, res, next) => {
  try {
    await deleteVehicleCategoryRule(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;