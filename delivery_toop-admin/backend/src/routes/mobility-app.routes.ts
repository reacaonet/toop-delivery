import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import favoritePlacesRoutes from './favorite-places.routes';
import favoriteDriversRoutes from './favorite-drivers.routes';
import chosenDestinationsRoutes from './chosen-destinations.routes';
import qrCodeRoutes from './qr-code.routes';
import indicationRoutes from './indication.routes';

const router = Router();

router.use('/favorite-place', authenticate, favoritePlacesRoutes);
router.use('/driver/favorite', authenticate, favoriteDriversRoutes);
router.use('/chosen-destinations', authenticate, chosenDestinationsRoutes);
router.use('/qrcode', authenticate, qrCodeRoutes);
router.use('/indication', authenticate, indicationRoutes);

export default router;
