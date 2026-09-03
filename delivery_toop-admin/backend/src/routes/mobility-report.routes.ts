import { Router } from 'express';
import mobilityReportController from '../controllers/mobility-report.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/adm/driver', mobilityReportController.admDriverReport);
router.get('/adm/driver/balance', mobilityReportController.admDriverBalance);
router.get('/adm/passenger', mobilityReportController.admPassengerReport);
router.get('/adm/passenger/balance', mobilityReportController.admPassengerBalance);
router.get('/adm/races', mobilityReportController.admRacesReport);
router.get('/adm/races/balance', mobilityReportController.admRacesBalance);
router.get('/driver', mobilityReportController.driverPaginator);
router.get('/map/monitoring', mobilityReportController.mapMonitoring);
router.get('/active/monitoring', mobilityReportController.activeMonitoring);

export default router;
