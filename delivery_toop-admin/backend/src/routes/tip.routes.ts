import { Router } from 'express';
import siteContentController from '../controllers/site-content.controller';

const router = Router();

router.get('/list', siteContentController.tipList);
router.post('/create', siteContentController.tipCreate);
router.delete('/delete/:id', siteContentController.tipRemove);
router.get('/search', siteContentController.tipSearch);

export default router;
