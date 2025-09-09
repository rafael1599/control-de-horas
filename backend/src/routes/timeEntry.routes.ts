import { Router } from 'express';
import { 
  clock, 
  getCompanyTimeEntries, 
  createManualTimeEntry, 
  deleteTimeEntry, 
  updateTimeEntry 
} from '../controllers/timeEntry.controller';

const router = Router();

// ... existing routes
router.post('/clock', clock);
router.get('/by-company/:companyId', getCompanyTimeEntries);
router.post('/manual', createManualTimeEntry);
router.delete('/:id', deleteTimeEntry);

// Nueva ruta para actualizar un turno
router.put('/:id', updateTimeEntry);

export default router;