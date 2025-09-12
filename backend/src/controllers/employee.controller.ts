import { Request, Response } from 'express';
import * as employeeService from '../services/employee.service';

// Controlador para obtener todos los empleados de una compañía
export const getEmployees = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { status } = req.query as { status: 'active' | 'inactive' };
    const employees = await employeeService.getAllEmployeesByCompany(companyId, status);
    res.json(employees);
  } catch (error) {
    console.error(`Error fetching employees for company ${req.params.companyId}:`, error);
    res.status(500).json({ error: "No se pudieron obtener los empleados" });
  }
};

// Controlador para crear un nuevo empleado
export const createEmployee = async (req: Request, res: Response) => {
  try {
    // Lógica corregida y definitiva:
    const { companyId, ...employeeData } = req.body;

    // Verificación para asegurar que companyId no sea undefined
    if (!companyId) {
      return res.status(400).json({ error: "companyId es requerido en el cuerpo de la petición." });
    }

    const newEmployee = await employeeService.createEmployee(employeeData, companyId);
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error("Error creating employee:", error);
    // @ts-ignore
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({ error: 'El correo electrónico ya está en uso.' });
    }
    res.status(500).json({ error: "No se pudo crear el empleado" });
  }
};

// Controlador para eliminar un empleado
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await employeeService.deleteEmployeeById(id);
    res.status(204).send();
  } catch (error) {
    // @ts-ignore
    if (error.message === 'Empleado no encontrado') {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }
    console.error(`Error deleting employee ${req.params.id}:`, error);
    res.status(500).json({ error: "No se pudo eliminar el empleado" });
  }
};

// Controlador para actualizar un empleado
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedEmployee = await employeeService.updateEmployeeById(id, req.body);
    res.json(updatedEmployee);
  } catch (error) {
    // @ts-ignore
    if (error.message === 'Empleado no encontrado') {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }
    console.error(`Error updating employee ${req.params.id}:`, error);
    res.status(500).json({ error: "No se pudo actualizar el empleado" });
  }
};

// Controlador para reactivar un empleado
export const reactivateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reactivatedEmployee = await employeeService.reactivateEmployeeById(id);
    res.json(reactivatedEmployee);
  } catch (error) {
    // @ts-ignore
    if (error.message === 'Miembro no encontrado') {
      return res.status(404).json({ error: "Miembro no encontrado" });
    }
    console.error(`Error reactivating employee ${req.params.id}:`, error);
    res.status(500).json({ error: "No se pudo reactivar el miembro" });
  }
};