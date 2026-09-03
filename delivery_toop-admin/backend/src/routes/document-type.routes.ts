import { Router } from 'express';
import documentTypeController from '../controllers/document-type.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/listAll', authenticate, documentTypeController.listAll);
router.get('/graphic', authenticate, documentTypeController.graphic);
router.get('/paginator', authenticate, documentTypeController.paginator);
router.get('/search', authenticate, documentTypeController.search);
router.get('/:id?', authenticate, documentTypeController.list);
router.post('/', authenticate, documentTypeController.create);
router.put('/:id', authenticate, documentTypeController.update);
router.delete('/:id', authenticate, documentTypeController.remove);

export default router;
