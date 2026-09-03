import { Router } from 'express';
import domainSettingsController from '../controllers/domain-settings.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/* State */
router.get('/state/listPorNome', authenticate, domainSettingsController.listStatesByNome);
router.get('/state/:id?', authenticate, domainSettingsController.listStates);
router.post('/state', authenticate, domainSettingsController.createState);
router.put('/state/:id', authenticate, domainSettingsController.updateState);
router.delete('/state/:id', authenticate, domainSettingsController.removeState);

/* City */
router.get('/city/normalize-cities', authenticate, domainSettingsController.normalizeCities);
router.get('/city/paginator', authenticate, domainSettingsController.paginateCities);
router.get('/city', authenticate, domainSettingsController.listCities);
router.post('/city', authenticate, domainSettingsController.createCity);
router.put('/city/:id', authenticate, domainSettingsController.updateCity);
router.delete('/city/:id', authenticate, domainSettingsController.removeCity);

/* TypesUsers */
router.get('/types-users/paginator', authenticate, domainSettingsController.paginateTypesUsers);
router.get('/types-users', authenticate, domainSettingsController.listTypesUsers);
router.post('/types-users', authenticate, domainSettingsController.createTypesUsers);
router.put('/types-users/:id', authenticate, domainSettingsController.updateTypesUsers);
router.delete('/types-users/:id', authenticate, domainSettingsController.removeTypesUsers);

/* AppVersion */
router.get('/app-versions/check', authenticate, domainSettingsController.checkAppVersion);
router.get('/app-versions', authenticate, domainSettingsController.listAppVersions);
router.post('/app-versions', authenticate, domainSettingsController.createAppVersion);

/* TimeZone */
router.get('/timezone', authenticate, domainSettingsController.listTimeZones);

/* Countries */
router.get('/countries', authenticate, domainSettingsController.listCountries);

/* App settings by franchise */
router.get('/app/:franchise', authenticate, domainSettingsController.appSettings);

export default router;
