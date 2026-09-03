import { Router } from 'express';
import chatMessageController from '../controllers/chat-message.controller';

const router = Router();

router.get('/:cartId', chatMessageController.listByCart);
router.post('', chatMessageController.create);

export default router;
