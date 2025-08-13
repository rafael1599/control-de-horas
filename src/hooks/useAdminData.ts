
import { useState, useCallback, useEffect } from 'react';
import { apiService, Employee, TimeLog, ApiResponse } from '@/services/api';

export const useAdminData = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { employees, logs }: ApiResponse = await apiService.fetchData();
      setEmployees(employees);
      setLogs(logs);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Wrapper function to handle API calls and data refetching
  const handleApiCall = async (apiCall: () => Promise<any>) => {
    try {
      await apiCall();
      await fetchData(); // Refetch data on success
    } catch (err) {
      setError('An API operation failed');
      console.error(err);
      // Optionally re-throw or handle error state for the UI
    }
  };

  const addEmployee = async (employee: Omit<Employee, 'id'> & { id: string }) => 
    await handleApiCall(() => apiService.addEmployee(employee));

  const updateEmployee = async (employee: Employee) => 
    await handleApiCall(() => apiService.updateEmployee(employee));

  const deleteEmployee = async (id: string) => 
    await handleApiCall(() => apiService.deleteEmployee(id));

  const updateLog = async (log: Partial<TimeLog> & { row: number }) => 
    await handleApiCall(() => apiService.updateLog(log));

  const deleteLog = async (row: number) => 
    await handleApiCall(() => apiService.deleteLog(row));
    
  const updateShift = async (entryRow: number, exitRow: number, entryTimestamp: string, exitTimestamp: string) =>
    await handleApiCall(() => apiService.updateShift(entryRow, exitRow, entryTimestamp, exitTimestamp));


  return {
    employees,
    logs,
    loading,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    updateLog,
    deleteLog,
    updateShift,
    reload: fetchData, // Expose reload function
  };
};
