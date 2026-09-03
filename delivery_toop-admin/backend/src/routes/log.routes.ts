import { Router } from 'express';
import logController from '../controllers/log.controller';

const router = Router();

router.get('/paginator', logController.paginator);
router.post('/create', logController.create);
router.get('/:id?', logController.list);

export default router;
