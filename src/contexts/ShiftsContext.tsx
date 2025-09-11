import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { type TimeLog, type OpenShift, type Shift } from '@/types'; // Shift se usará implicitamente
import { toast } from 'sonner';
import { useEmployees } from './EmployeesContext';
import { differenceInSeconds } from 'date-fns';
import { formatDuration } from '@/lib/utils';
import { getTimeEntriesByCompany, createManualShift, deleteShift as apiDeleteShift, updateShift as apiUpdateShift } from '@/services/api';
import { MAX_SHIFT_MINUTES } from '@/config/rules';
import { differenceInMinutes } from 'date-fns';

// El backend ahora devuelve objetos TimeEntry, que son funcionalmente equivalentes a nuestros Shifts.
// Usaremos el tipo TimeLog como base para nuestros turnos procesados.
interface ShiftsContextType {
  shifts: TimeLog[]; // Esto contendrá los turnos procesados
  openShifts: OpenShift[];
  processedShifts: ProcessedShift[]; // ADDED
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
  const [shifts, setShifts] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { employees, companyId } = useEmployees();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const reloadShifts = useCallback(async () => {
    console.log("ShiftsContext: Iniciando reloadShifts...");
    if (!companyId) {
      console.log("ShiftsContext: companyId no disponible, saltando reloadShifts.");
      return;
    }
    setLoading(true);
    try {
      const timeEntries = await getTimeEntriesByCompany(companyId);
      console.log("ShiftsContext: timeEntries recibidos del backend:", timeEntries);
      
      // Transformamos los TimeEntry del backend a dos TimeLog (entrada y salida) para mantener la compatibilidad
      // con la lógica de procesamiento existente en ShiftsTable.
      const processedLogs: TimeLog[] = timeEntries.flatMap((entry, index) => {
        const logs: TimeLog[] = [];
        logs.push({
          shiftId: entry.id, // <-- ID REAL AÑADIDO
          employeeId: entry.employeeId,
          timestamp: entry.start_time,
          type: 'ENTRADA',
          row: index * 2 + 1, // Simulación de número de fila
          source: 'backend',
        });
        if (entry.end_time) {
          logs.push({
            shiftId: entry.id, // <-- ID REAL AÑADIDO
            employeeId: entry.employeeId,
            timestamp: entry.end_time,
            type: 'SALIDA',
            row: index * 2 + 2, // Simulación de número de fila
            source: 'backend',
          });
        }
        return logs;
      });

      // Sort processedLogs by timestamp to ensure correct open/close logic
      processedLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      setShifts(processedLogs);
      console.log("ShiftsContext: shifts actualizados a:", processedLogs);
      setError(null);
    } catch (err) {
      setError('Failed to fetch shifts');
      console.error("ShiftsContext: Error en reloadShifts:", err);
      toast.error('Error al cargar los turnos.');
    } finally {
      setLoading(false);
      console.log("ShiftsContext: reloadShifts finalizado.");
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) reloadShifts();
  }, [reloadShifts, companyId]);

  // NUEVO: useEffect para el polling
  useEffect(() => {
    const POLLING_INTERVAL = 7 * 60 * 1000; // 7 minutos

    console.log("ShiftsContext: Configurando polling cada 7 minutos.");
    const intervalId = setInterval(() => {
      console.log("ShiftsContext: Ejecutando reloadShifts desde el polling.");
      reloadShifts();
    }, POLLING_INTERVAL);

    // Función de limpieza para detener el intervalo cuando el componente se desmonte
    return () => {
      console.log("ShiftsContext: Limpiando intervalo de polling.");
      clearInterval(intervalId);
    };
  }, [reloadShifts]); // El array de dependencias asegura que se use la última versión de reloadShifts

  const openShifts = useMemo((): OpenShift[] => {
    const openShiftsMap = new Map<string, Date>();

    shifts.forEach(log => {
      if (log.type === 'ENTRADA') {
        openShiftsMap.set(log.employeeId, new Date(log.timestamp));
      } else if (log.type === 'SALIDA') {
        openShiftsMap.delete(log.employeeId);
      }
    });

    const employeeMap = new Map(employees.map(e => [e.id, e.full_name]));
    const openShiftsData: OpenShift[] = [];

    openShiftsMap.forEach((entryTimestamp, employeeId) => {
      const employeeName = employeeMap.get(employeeId);
      if (employeeName) {
        const totalSeconds = differenceInSeconds(currentTime, entryTimestamp);
        openShiftsData.push({
          employeeId,
          employeeName,
          entryTimestamp,
          liveDuration: formatDuration(totalSeconds),
        });
      }
    });

    return openShiftsData;
  }, [shifts, employees, currentTime]);

  const processedShifts = useMemo((): ProcessedShift[] => {
    const shiftsMap = new Map<string, { entry?: TimeLog, exit?: TimeLog }>();

    shifts.forEach(log => {
      if (log.shiftId) {
        const current = shiftsMap.get(log.shiftId) || {};
        if (log.type === 'ENTRADA') {
          current.entry = log;
        } else if (log.type === 'SALIDA') {
          current.exit = log;
        }
        shiftsMap.set(log.shiftId, current);
      }
    });

    const employeeMap = new Map(employees.map(e => [e.id, e.full_name]));
    const result: ProcessedShift[] = [];

    shiftsMap.forEach((shiftLogs, shiftId) => {
      if (shiftLogs.entry) {
        const employeeName = employeeMap.get(shiftLogs.entry.employeeId) || 'Unknown';
        const entryTimestamp = shiftLogs.entry.timestamp;
        const exitTimestamp = shiftLogs.exit?.timestamp;
        const duration = exitTimestamp ? differenceInSeconds(new Date(exitTimestamp), new Date(entryTimestamp)) : undefined;
        
        // NEW: Anomaly detection logic
        let isAnomalous = false;
        if (exitTimestamp) {
          // For closed shifts
          isAnomalous = differenceInMinutes(new Date(exitTimestamp), new Date(entryTimestamp)) > MAX_SHIFT_MINUTES;
        } else {
          // For open shifts
          isAnomalous = differenceInMinutes(new Date(), new Date(entryTimestamp)) > MAX_SHIFT_MINUTES;
        }

        result.push({
          id: shiftId,
          employeeId: shiftLogs.entry.employeeId,
          employeeName,
          entryTimestamp,
          exitTimestamp,
          entryRow: shiftLogs.entry.row,
          exitRow: shiftLogs.exit?.row,
          duration: duration ? formatDuration(duration) : undefined, // Assuming formatDuration handles seconds
          isAnomalous, // Use the calculated value
        });
      }
    });

    return result;
  }, [shifts, employees]);

  const addShift = async (shiftData: { employeeId: string; start_time: Date; end_time: Date; }) => {
    if (!companyId) {
      toast.error('Error: No se pudo encontrar el ID de la compañía.');
      throw new Error('Company ID not found');
    }
    try {
      await createManualShift({ ...shiftData, companyId });
      toast.success('Turno manual agregado exitosamente');
      await reloadShifts();
    } catch (err) {
      console.error(err);
      const errorMessage = (err as Error).message || 'No se pudo agregar el turno.';
      toast.error('Error al agregar el turno', { description: errorMessage });
      throw err;
    }
  };

  const updateShift = async (shiftId: string, shiftData: { start_time?: Date; end_time?: Date }) => {
    try {
      await apiUpdateShift(shiftId, shiftData);
      toast.success('Turno actualizado exitosamente');
      await reloadShifts();
    } catch (err) {
      console.error(err);
      const errorMessage = (err as Error).message || 'No se pudo actualizar el turno.';
      toast.error('Error al actualizar el turno', { description: errorMessage });
      throw err;
    }
  };
  const deleteShift = async (shiftId: string) => {
    try {
      await apiDeleteShift(shiftId); // Assuming you rename the import
      toast.success('Turno eliminado exitosamente');
      await reloadShifts();
    } catch (err) {
      console.error(err);
      const errorMessage = (err as Error).message || 'No se pudo eliminar el turno.';
      toast.error('Error al eliminar el turno', { description: errorMessage });
      throw err;
    }
  };

  return (
    <ShiftsContext.Provider value={{ shifts, openShifts, processedShifts, loading, reloadShifts, addShift, updateShift, deleteShift, error }}>
      {children}
    </ShiftsContext.Provider>
  );
};