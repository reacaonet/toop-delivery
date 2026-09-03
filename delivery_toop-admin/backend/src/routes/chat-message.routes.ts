import { Router } from 'express';
import chatMessageController from '../controllers/chat-message.controller';

const router = Router();

router.get('/', chatMessageController.list);
router.get('/message/total/no-read/:cartId', chatMessageController.noRead);
router.post('/', chatMessageController.create);
router.put('/read', chatMessageController.updateRead);

export default router;
