import { Router } from 'express';
import { initializeCompany } from '../controllers/setup.controller';

const router = Router();

router.post('/initialize', initializeCompany);

export default router;