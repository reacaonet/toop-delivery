import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import documentTypeRoutes from './document-type.routes';
import peakHourRoutes from './peak-hour.routes';
import supportSubjectRoutes from './support-subject.routes';
import vehicleDocumentsRoutes from './vehicle-documents.routes';

const router = Router();

router.use('/documenttypes', authenticate, documentTypeRoutes);
router.use('/peakhours', authenticate, peakHourRoutes);
router.use('/supportsubjects', authenticate, supportSubjectRoutes);
router.use('/vehicle-documents', authenticate, vehicleDocumentsRoutes);

export default router;
