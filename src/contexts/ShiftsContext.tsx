import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiService } from '@/services/api';
import { type TimeLog } from '@/types';
import { processRawLogs } from '../lib/processors';
import { toast } from 'sonner';
import { LOG_SHEET_NAME } from '../config/sheets';
import { useEmployees } from './EmployeesContext';

interface ShiftsContextType {
  shifts: TimeLog[];
  loading: boolean;
  error: string | null;
  addShift: (employeeId: string, type: 'ENTRADA' | 'SALIDA', timestamp?: string) => Promise<void>;
  updateShift: (entryRow: number, exitRow: number, entryTimestamp: string, exitTimestamp: string) => Promise<void>;
  deleteLog: (row: number) => Promise<void>;
  reloadShifts: () => void;
}

const ShiftsContext = createContext<ShiftsContextType | undefined>(undefined);

export const useShifts = () => {
  const context = useContext(ShiftsContext);
  if (!context) {
    throw new Error('useShifts must be used within a ShiftsProvider');
  }
  return context;
};

export const ShiftsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { employees } = useEmployees(); // Get employees from context
  const [shifts, setShifts] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShifts = useCallback(async () => {
    try {
      setLoading(true);
      const { logs: rawLogs } = await apiService.fetchData();
      const processedLogs = processRawLogs(rawLogs);
      setShifts(processedLogs);
      setError(null);
    } catch (err) {
      setError('Failed to fetch shifts');
      console.error(err);
      toast.error('Error al cargar los turnos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  // --- Optimistic addShift ---
  const addShift = async (employeeId: string, type: 'ENTRADA' | 'SALIDA', timestamp?: string) => {
    const newLog: TimeLog = {
      id: `temp-${Date.now()}`,
      employeeId,
      type,
      timestamp: timestamp || new Date().toISOString(),
      source: 'Automático',
      row: -1, // Temporary row
    };

    const previousShifts = shifts;
    setShifts(prevShifts => [newLog, ...prevShifts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

    try {
      // Construct rowData for addRow
      const employee = employees.find(emp => emp.id === employeeId); // Need employees from context
      const rowData = [
        newLog.timestamp,
        `'${newLog.employeeId}`,
        employee ? employee.name : 'Desconocido',
        newLog.type,
        newLog.source
      ];
      await apiService.addRow(LOG_SHEET_NAME, rowData);
      // After successful API call, refetch to get the real data
      await fetchShifts();
    } catch (err) {
      console.error(err);
      toast.error(`Error al registrar la ${type.toLowerCase()}. Revirtiendo cambio.`);
      // On error, revert to the previous state
      setShifts(previousShifts);
    }
  };

  // --- Optimistic updateShift ---
  const updateShift = async (entryRow: number, exitRow: number, entryTimestamp: string, exitTimestamp: string) => {
    const previousShifts = shifts;

    // Optimistically update the UI
    setShifts(prevShifts =>
      prevShifts.map(shift => {
        if (shift.row === entryRow) {
          return { ...shift, timestamp: entryTimestamp };
        }
        if (shift.row === exitRow) {
          return { ...shift, timestamp: exitTimestamp };
        }
        return shift;
      })
    );

    try {
      // Update entry timestamp (column 1)
      await apiService.updateCell(LOG_SHEET_NAME, entryRow, 1, entryTimestamp);
      // Update exit timestamp (column 1)
      await apiService.updateCell(LOG_SHEET_NAME, exitRow, 1, exitTimestamp);
      // Update source to 'Manual Edit' (column 5)
      await apiService.updateCell(LOG_SHEET_NAME, entryRow, 5, 'Manual Edit');
      await apiService.updateCell(LOG_SHEET_NAME, exitRow, 5, 'Manual Edit');

      toast.success('Turno actualizado correctamente.');
      await fetchShifts(); // Refetch to sync with server
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar el turno. Revirtiendo cambio.');
      setShifts(previousShifts);
    }
  };

  // --- Optimistic deleteLog ---
  const deleteLog = async (row: number) => {
    const previousShifts = shifts;
    
    // Optimistically remove the log
    setShifts(prevShifts => prevShifts.filter(shift => shift.row !== row));

    try {
      await apiService.deleteRow(LOG_SHEET_NAME, row); // Use new low-level API
      toast.success('Registro eliminado correctamente.');
      // No need to refetch, already removed locally
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar el registro. Revirtiendo cambio.');
      setShifts(previousShifts);
    }
  };

  return (
    <ShiftsContext.Provider
      value={{
        shifts,
        loading,
        error,
        addShift,
        updateShift,
        deleteLog,
        reloadShifts: fetchShifts,
      }}
    >
      {children}
    </ShiftsContext.Provider>
  );
};