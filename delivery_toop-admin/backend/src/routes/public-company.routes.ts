import { Router } from 'express';
import publicCompanyController from '../controllers/public-company.controller';

const router = Router();

router.post('/register-company', publicCompanyController.registerCompany);
router.get('/location', publicCompanyController.listLocation);

export default router;
