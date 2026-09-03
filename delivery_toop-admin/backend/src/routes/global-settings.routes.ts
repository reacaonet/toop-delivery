import { Router } from 'express';
import domainSettingsController from '../controllers/domain-settings.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, domainSettingsController.getGlobalSettings);

export default router;
