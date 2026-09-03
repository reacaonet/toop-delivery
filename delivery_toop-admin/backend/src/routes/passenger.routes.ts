import { Router } from 'express';
import passengerController from '../controllers/passenger.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/active-run/:passenger', authenticate, passengerController.activeRun);
router.get('/listAll', authenticate, passengerController.listAll);
router.get('/graphic', authenticate, passengerController.graphic);
router.get('/paginator', authenticate, passengerController.paginator);
router.get('/search', authenticate, passengerController.search);
router.get('/filter', authenticate, passengerController.filter);
router.get('/list/:id?', authenticate, passengerController.list);
router.get('/:id?', authenticate, passengerController.list);
router.post('/link-frachise', authenticate, passengerController.linkToFranchise);
router.post('/', authenticate, passengerController.create);
router.put('/:id', authenticate, passengerController.update);
router.delete('/:id', authenticate, passengerController.remove);

export default router;
