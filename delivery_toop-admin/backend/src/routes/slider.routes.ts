import { Router } from 'express';
import siteContentController from '../controllers/site-content.controller';

const router = Router();

router.get('/paginator', siteContentController.sliderPaginator);
router.get('/list', siteContentController.sliderList);
router.post('/register', siteContentController.sliderRegister);
router.post('/create', siteContentController.sliderCreate);
router.put('/update/:id', siteContentController.sliderUpdate);
router.delete('/delete/:id', siteContentController.sliderRemove);

export default router;
