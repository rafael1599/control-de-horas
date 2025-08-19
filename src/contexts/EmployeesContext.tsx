import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiService } from '@/services/api';
import { type Employee } from '@/types';
import { toast } from 'sonner';

interface EmployeesContextType {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  addEmployee: (employee: Employee) => Promise<void>;
  updateEmployee: (employee: Employee) => Promise<void>;
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

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      console.log('EmployeesContext: Setting loading to true');
      const { employees } = await apiService.fetchData();
      setEmployees(employees);
      setError(null);
    } catch (err) {
      setError('Failed to fetch employees');
      console.error(err);
      toast.error('Error al cargar los empleados.');
    } finally {
      setLoading(false);
      console.log('EmployeesContext: Setting loading to false');
    }
  }, []);

  console.log('EmployeesProvider rendering, current loading state:', loading);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleOptimisticUpdate = async (
    apiCall: () => Promise<any>,
    optimisticUpdate: () => void
  ) => {
    const previousState = [...employees];
    optimisticUpdate();
    try {
      await apiCall();
      toast.success('Operación de empleado completada.');
    } catch (err) {
      console.error(err);
      toast.error('Falló la operación. Revirtiendo cambios.');
      setEmployees(previousState);
    }
  };

  const addEmployee = async (employee: Employee) => {
    await handleOptimisticUpdate(
      () => apiService.addEmployee(employee),
      () => setEmployees(current => [...current, employee])
    );
  };

  const updateEmployee = async (employee: Employee) => {
    await handleOptimisticUpdate(
      () => apiService.updateEmployee(employee),
      () => setEmployees(current => current.map(e => (e.id === employee.id ? employee : e)))
    );
  };

  const deleteEmployee = async (id: string) => {
    await handleOptimisticUpdate(
      () => apiService.deleteEmployee(id),
      () => setEmployees(current => current.filter(e => e.id !== id))
    );
  };

  return (
    <EmployeesContext.Provider
      value={{
        employees,
        loading,
        error,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        reloadEmployees: fetchEmployees,
      }}
    >
      {children}
    </EmployeesContext.Provider>
  );
};
