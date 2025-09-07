import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { updateShift, deleteLog } from '@/services/api';
import { type TimeLog } from '@/types';
import { toast } from 'sonner';

interface ShiftsContextType {
  shifts: TimeLog[];
  loading: boolean;
  error: string | null;
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
  const [shifts, setShifts] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShifts = useCallback(async () => {
    try {
      setLoading(true);
      // const { logs } = await fetchData(); // TODO: Re-implementar con la nueva API
      setShifts([]); // Devolver un array vacío por ahora
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

  const handleRefetchingApiCall = async (apiCall: () => Promise<any>) => {
    try {
      await apiCall();
      await fetchShifts();
      toast.success('Operación de turno completada y datos actualizados.');
    } catch (err) {
      setError('An API operation failed');
      console.error(err);
      toast.error('La operación de turno falló.');
    }
  };

  const updateShift = async (entryRow: number, exitRow: number, entryTimestamp: string, exitTimestamp: string) => {
    await handleRefetchingApiCall(() =>
      updateShift(entryRow, exitRow, entryTimestamp, exitTimestamp)
    );
  };

  const deleteLog = async (row: number) => {
    await handleRefetchingApiCall(() => deleteLog(row));
  };

  return (
    <ShiftsContext.Provider
      value={{
        shifts,
        loading,
        error,
        updateShift,
        deleteLog,
        reloadShifts: fetchShifts,
      }}
    >
      {children}
    </ShiftsContext.Provider>
  );
};