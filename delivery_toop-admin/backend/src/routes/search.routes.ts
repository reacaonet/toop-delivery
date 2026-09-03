import { Router } from 'express';
import searchController from '../controllers/search.controller';

const router = Router();

router.get('/company-products', searchController.list);
router.get('/segment/company-products', searchController.listForSegments);

export default router;
