import { Router } from 'express';
import supportSubjectController from '../controllers/support-subject.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/listAll', authenticate, supportSubjectController.listAll);
router.get('/graphic', authenticate, supportSubjectController.graphic);
router.get('/paginator', authenticate, supportSubjectController.paginator);
router.get('/search', authenticate, supportSubjectController.search);
router.get('/:id?', authenticate, supportSubjectController.list);
router.post('/', authenticate, supportSubjectController.create);
router.put('/:id', authenticate, supportSubjectController.update);
router.delete('/:id', authenticate, supportSubjectController.remove);

export default router;
