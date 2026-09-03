import { Router } from 'express';
import mobilityEvaluationController from '../controllers/mobility-evaluation.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', mobilityEvaluationController.list);
router.get('/:rated', mobilityEvaluationController.getAverageRating);
router.get('/driver/paginator', mobilityEvaluationController.paginateByDriver);
router.post('/', mobilityEvaluationController.create);

export default router;
