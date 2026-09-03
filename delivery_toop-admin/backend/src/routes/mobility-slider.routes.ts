import { Router } from 'express';
import mobilitySliderController from '../controllers/mobility-slider.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/paginator', authenticate, mobilitySliderController.paginator);
router.get('/:id?', authenticate, mobilitySliderController.listById);
router.get('/', authenticate, mobilitySliderController.list);
router.post('/', authenticate, mobilitySliderController.create);
router.put('/:id', authenticate, mobilitySliderController.update);
router.delete('/:id', authenticate, mobilitySliderController.remove);

export default router;
