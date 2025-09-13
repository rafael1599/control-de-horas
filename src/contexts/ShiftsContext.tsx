import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { type TimeEntry, type OpenShift, type ProcessedShift } from '@/types';
import { toast } from 'sonner';
import { useEmployees } from './EmployeesContext';
import { differenceInSeconds, differenceInMinutes } from 'date-fns';
import { formatDuration } from '@/lib/utils';
import { getTimeEntriesByCompany, createManualShift, deleteShift as apiDeleteShift, updateShift as apiUpdateShift } from '@/services/api';
import { MAX_SHIFT_MINUTES } from '@/config/rules';

interface ShiftsContextType {
  timeEntries: TimeEntry[];
  openShifts: OpenShift[];
  processedShifts: ProcessedShift[];
  loading: boolean;
  reloadShifts: () => void;
  addShift: (shiftData: { employeeId: string; start_time: Date; end_time: Date; }) => Promise<void>;
  updateShift: (shiftId: string, shiftData: { start_time?: Date; end_time?: Date }) => Promise<void>;
  deleteShift: (shiftId: string) => Promise<void>;
  error: string | null;
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
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { employees, companyId } = useEmployees();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const reloadShifts = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const entries = await getTimeEntriesByCompany(companyId);
      // Los datos de la API ya vienen ordenados, pero una re-ordenación en el cliente no hace daño.
      entries.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
      setTimeEntries(entries);
      setError(null);
    } catch (err) {
      setError('Failed to fetch shifts');
      console.error("ShiftsContext: Error en reloadShifts:", err);
      toast.error('Error al cargar la actividad.');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) reloadShifts();
  }, [reloadShifts, companyId]);

  useEffect(() => {
    const POLLING_INTERVAL = 7 * 60 * 1000; // 7 minutos
    const intervalId = setInterval(() => reloadShifts(), POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, [reloadShifts]);

  const openShifts = useMemo((): OpenShift[] => {
    const employeeMap = new Map(employees.map(e => [e.id, e.full_name]));
    
    return timeEntries
      .filter(entry => !entry.end_time)
      .map(entry => {
        const employeeName = employeeMap.get(entry.employeeId) || 'Unknown';
        const totalSeconds = differenceInSeconds(currentTime, new Date(entry.start_time));
        return {
          employeeId: entry.employeeId,
          employeeName,
          entryTimestamp: new Date(entry.start_time),
          liveDuration: formatDuration(totalSeconds),
        };
      });
  }, [timeEntries, employees, currentTime]);

  const processedShifts = useMemo((): ProcessedShift[] => {
    const employeeMap = new Map(employees.map(e => [e.id, e.full_name]));

    return timeEntries.map(entry => {
      const employeeName = employeeMap.get(entry.employeeId) || 'Unknown';
      const entryTimestamp = new Date(entry.start_time);
      const exitTimestamp = entry.end_time ? new Date(entry.end_time) : undefined;
      const duration = exitTimestamp ? differenceInSeconds(exitTimestamp, entryTimestamp) : undefined;

      let isAnomalous = false;
      if (exitTimestamp) {
        isAnomalous = differenceInMinutes(exitTimestamp, entryTimestamp) > MAX_SHIFT_MINUTES;
      } else {
        isAnomalous = differenceInMinutes(currentTime, entryTimestamp) > MAX_SHIFT_MINUTES;
      }

      return {
        id: entry.id,
        employeeId: entry.employeeId,
        employeeName,
        entryTimestamp: entryTimestamp,
        exitTimestamp: exitTimestamp,
        duration: duration ? formatDuration(duration) : undefined,
        isAnomalous,
      };
    });
  }, [timeEntries, employees, currentTime]);

  const addShift = async (shiftData: { employeeId: string; start_time: Date; end_time: Date; }) => {
    if (!companyId) {
      toast.error('Error: No se pudo encontrar el ID de la compañía.');
      throw new Error('Company ID not found');
    }
    try {
      await createManualShift({ ...shiftData, companyId });
      toast.success('Actividad manual añadida exitosamente');
      await reloadShifts();
    } catch (err) {
      console.error(err);
      const errorMessage = (err as Error).message || 'No se pudo añadir la actividad.';
      toast.error('Error al añadir actividad', { description: errorMessage });
      throw err;
    }
  };

  const updateShift = async (shiftId: string, shiftData: { start_time?: Date; end_time?: Date }) => {
    try {
      await apiUpdateShift(shiftId, shiftData);
      toast.success('Actividad actualizada exitosamente');
      await reloadShifts();
    } catch (err) {
      console.error(err);
      const errorMessage = (err as Error).message || 'No se pudo actualizar la actividad.';
      toast.error('Error al actualizar la actividad', { description: errorMessage });
      throw err;
    }
  };

  const deleteShift = async (shiftId: string) => {
    try {
      await apiDeleteShift(shiftId);
      toast.success('Actividad eliminada exitosamente');
      await reloadShifts();
    } catch (err) {
      console.error(err);
      const errorMessage = (err as Error).message || 'No se pudo eliminar la actividad.';
      toast.error('Error al eliminar la actividad', { description: errorMessage });
      throw err;
    }
  };

  return (
    <ShiftsContext.Provider value={{ timeEntries, openShifts, processedShifts, loading, reloadShifts, addShift, updateShift, deleteShift, error }}>
      {children}
    </ShiftsContext.Provider>
  );
};