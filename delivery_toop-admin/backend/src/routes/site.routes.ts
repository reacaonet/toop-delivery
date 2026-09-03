import { Router } from 'express';
import siteContentController from '../controllers/site-content.controller';

const router = Router();

router.get('/paginator', siteContentController.sitePaginator);
router.get('/', siteContentController.siteList);
router.post('/', siteContentController.siteCreate);
router.delete('/:id', siteContentController.siteRemove);
router.put('/:id', siteContentController.siteUpdate);

export default router;
