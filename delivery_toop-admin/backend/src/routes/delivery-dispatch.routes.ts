import { Router } from 'express';
import deliveryDispatchController from '../controllers/delivery-dispatch.controller';

const router = Router();

// Fila (queue)
router.get('/queue', deliveryDispatchController.queueList);
router.get('/queue/status/:status', deliveryDispatchController.queueStatusOne);
router.get('/queue/have-queue-active/:orderId', deliveryDispatchController.queueHaveActive);
router.put('/queue/:queueId', deliveryDispatchController.queueUpdate);
router.put('/queue/:queueId/status', deliveryDispatchController.queueUpdateStatus);
router.put('/queue-notification-received/:orderId', deliveryDispatchController.queueUpdateReceived);
router.put('/back-to-queue', deliveryDispatchController.backToQueue);

// Online
router.post('/online', deliveryDispatchController.onlineCreate);
router.put('/offline/:deliveryMan', deliveryDispatchController.onlineOffline);
router.get('/online-last-week/:deliveryMan', deliveryDispatchController.onlineListLastWeek);

// Corridas
router.post('/race/canceled', deliveryDispatchController.raceCanceled);
router.get('/race/list', deliveryDispatchController.raceCanceledList);
router.post('/race-history', deliveryDispatchController.raceHistory);

// Preço
router.get('/delivery-price/:orderId', deliveryDispatchController.deliveryPrice);
router.get('/price/:orderId', deliveryDispatchController.deliveryPrice);

export default router;
