import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import mobilityNotificationRoutes from './mobility-notification.routes';
import mobilityPushNotificationRoutes from './mobility-push-notification.routes';
import mobilityTopicRoutes from './mobility-topic.routes';
import mobilityMessageRoutes from './mobility-message.routes';
import mobilityExtractRoutes from './mobility-extract.routes';
import mobilityTypePaymentRoutes from './mobility-type-payment.routes';
import mobilityDiscountRoutes from './mobility-discount.routes';
import mobilitySliderRoutes from './mobility-slider.routes';

const router = Router();

router.use('/notifications', authenticate, mobilityNotificationRoutes);
router.use('/push-notification', authenticate, mobilityPushNotificationRoutes);
router.use('/topic', authenticate, mobilityTopicRoutes);
router.use('/message', authenticate, mobilityMessageRoutes);
router.use('/extract', authenticate, mobilityExtractRoutes);
router.use('/type-payment-service', authenticate, mobilityTypePaymentRoutes);
router.use('/discount', authenticate, mobilityDiscountRoutes);
router.use('/slider', authenticate, mobilitySliderRoutes);

export default router;
