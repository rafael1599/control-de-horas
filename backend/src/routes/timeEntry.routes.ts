import { Router } from 'express';
import { clock } from '../controllers/timeEntry.controller';

const router = Router();

// POST /api/v1/time-entries/clock
router.post('/clock', clock);

export default router;