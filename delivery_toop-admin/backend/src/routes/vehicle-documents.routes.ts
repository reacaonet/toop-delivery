import { Router } from 'express';
import vehicleDocumentsController from '../controllers/vehicle-documents.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/paginator', authenticate, vehicleDocumentsController.paginator);
router.get('/:driver', authenticate, vehicleDocumentsController.listByDriver);
router.post('/', authenticate, vehicleDocumentsController.create);
router.put('/:id', authenticate, vehicleDocumentsController.update);

export default router;
