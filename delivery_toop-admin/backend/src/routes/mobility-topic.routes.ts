import { Router } from 'express';
import mobilityTopicController from '../controllers/mobility-topic.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/link-user-topics', authenticate, mobilityTopicController.linkUserTopics);
router.post('/', authenticate, mobilityTopicController.create);
router.post('/send', authenticate, mobilityTopicController.send);

export default router;
