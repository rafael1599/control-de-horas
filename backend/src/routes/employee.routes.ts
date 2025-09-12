import { Router } from 'express';
import { getEmployees, createEmployee, deleteEmployee, updateEmployee, reactivateEmployee } from '../controllers/employee.controller';

const router = Router();

// Definimos las rutas para el recurso "employees"

// GET /api/v1/employees/by-company/:companyId
router.get('/by-company/:companyId', getEmployees);

// POST /api/v1/employees
router.post('/', createEmployee);

// PUT /api/v1/employees/:id
router.put('/:id', updateEmployee);

// DELETE /api/v1/employees/:id
router.delete('/:id', deleteEmployee);

// PATCH /api/v1/employees/:id/reactivate
router.patch('/:id/reactivate', reactivateEmployee);

export default router;