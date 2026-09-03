import { Router } from 'express';
import siteContentController from '../controllers/site-content.controller';

const router = Router();

router.get('/list', siteContentController.tabloidList);
router.post('/register', siteContentController.tabloidRegister);
router.post('/create', siteContentController.tabloidCreate);
router.put('/update/:id', siteContentController.tabloidUpdate);
router.delete('/delete/:id', siteContentController.tabloidRemove);

export default router;
