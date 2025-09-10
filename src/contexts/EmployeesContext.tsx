import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getEmployeesByCompany, createEmployee, deleteEmployeeById, updateEmployeeById } from '@/services/api';
import { type Employee, type EmployeeCreationData } from '@/types';
import { toast } from 'sonner';

interface EmployeesContextType {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  companyId: string | null; // <-- AÑADIDO
  addEmployee: (employeeData: EmployeeCreationData) => Promise<void>;
  updateEmployee: (employeeId: string, data: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  reloadEmployees: () => void;
}

const EmployeesContext = createContext<EmployeesContextType | undefined>(undefined);

export const useEmployees = () => {
  const context = useContext(EmployeesContext);
  if (!context) {
    throw new Error('useEmployees must be used within an EmployeesProvider');
  }
  return context;
};

export const EmployeesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ID de compañía hardcoded temporalmente. Ahora será accesible globalmente.
  const companyId = import.meta.env.VITE_COMPANY_ID;

  const reloadEmployees = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const fetchedEmployees = await getEmployeesByCompany(companyId);
      setEmployees(fetchedEmployees);
      setError(null);
    } catch (err) {
      setError('Failed to fetch employees');
      console.error(err);
      toast.error('Error al cargar los empleados.');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    reloadEmployees();
  }, [reloadEmployees]);

  const addEmployee = async (employeeData: EmployeeCreationData) => {
    if (!companyId) {
      toast.error("Error: ID de compañía no encontrado.");
      return;
    }
    try {
      await createEmployee(employeeData, companyId);
      toast.success('Empleado agregado exitosamente');
      await reloadEmployees();
    } catch (err) {
      console.error(err);
      const errorMessage = (err as Error).message || 'No se pudo agregar el empleado.';
      toast.error('Error al agregar empleado', { description: errorMessage });
      throw err;
    }
  };

  const updateEmployee = async (employeeId: string, data: Partial<Employee>) => {
    try {
      await updateEmployeeById(employeeId, data);
      toast.success('Empleado actualizado correctamente.');
      await reloadEmployees();
    } catch (error) {
      console.error('Failed to update employee:', error);
      const errorMessage = (error as Error).message || 'No se pudo actualizar el empleado.';
      toast.error('Error al actualizar', { description: errorMessage });
    }
  };

  const deleteEmployee = async (employeeId: string) => {
    try {
      await deleteEmployeeById(employeeId);
      toast.success('Empleado eliminado correctamente.');
      await reloadEmployees();
    } catch (error) {
      console.error('Failed to delete employee:', error);
      const errorMessage = (error as Error).message || 'No se pudo eliminar el empleado.';
      toast.error('Error al eliminar', { description: errorMessage });
    }
  };

  return (
    <EmployeesContext.Provider
      value={{
        employees,
        loading,
        error,
        companyId, // <-- AÑADIDO
        addEmployee,
        updateEmployee,
        deleteEmployee,
        reloadEmployees,
      }}
    >
      {children}
    </EmployeesContext.Provider>
  );
};
