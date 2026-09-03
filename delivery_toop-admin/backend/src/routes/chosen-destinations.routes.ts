import { Router } from 'express';
import chosenDestinationsController from '../controllers/chosen-destinations.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, chosenDestinationsController.list);
router.post('/', authenticate, chosenDestinationsController.create);
router.put('/:driver/:id', authenticate, chosenDestinationsController.update);
router.delete('/:driver/:id', authenticate, chosenDestinationsController.remove);

export default router;
