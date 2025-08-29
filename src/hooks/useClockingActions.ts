import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { type Employee, type TimeLog } from '@/types';
import { differenceInMinutes, format } from 'date-fns';
import { useEmployees } from '@/contexts/EmployeesContext';
import { useShifts } from '@/contexts/ShiftsContext';
import { LOG_SHEET_NAME } from '@/config/sheets';
import { MAX_SHIFT_MINUTES, FAST_CLOCK_IN_THRESHOLD_MINUTES } from '@/lib/validators';
import { TOAST_MESSAGES, DIALOG_MESSAGES } from '@/lib/messages';

interface UseClockingActionsProps {
  initialLogs: TimeLog[]; // Renamed from displayLogs
  employees: Employee[];
}

export const useClockingActions = ({ initialLogs, employees }: UseClockingActionsProps) => {
  const { toast } = useToast();
  const { reloadShifts, deleteLog } = useShifts();

  const [displayLogs, setDisplayLogs] = useState<TimeLog[]>(initialLogs); // Internal state for displayLogs
  const [pendingClockIn, setPendingClockIn] = useState<{ tempId: string; timerId: NodeJS.Timeout; realRow?: number; } | null>(null);
  const [showClockInWarning, setShowClockInWarning] = useState(false);
  const [pendingClockInData, setPendingClockInData] = useState<{ employeeId: string, type: 'ENTRADA' | 'SALIDA' } | null>(null);
  const [lastClockOutTime, setLastClockOutTime] = useState<string>('');
  const [showTurnCompletedWarning, setShowTurnCompletedWarning] = useState(false);
  const [showLongTurnWarning, setShowLongTurnWarning] = useState(false);

  // Removed useEffect that synchronizes displayLogs with initialLogs

  const handleCancelClockIn = async () => {
    if (!pendingClockIn) return;

    clearTimeout(pendingClockIn.timerId);
    setDisplayLogs(prevLogs => prevLogs.filter(log => log.id !== pendingClockIn.tempId)); // Update internal displayLogs

    if (pendingClockIn.realRow) {
      await deleteLog(pendingClockIn.realRow);
    }
    
    setPendingClockIn(null);
    toast({ title: TOAST_MESSAGES.CLOCK_IN_UNDO_SUCCESS });
  };

  const proceedWithClockIn = async (employeeId: string) => {
      try {
        await apiService.addLog(employeeId, 'ENTRADA');
        reloadShifts();
        const employee = employees.find(e => e.id === employeeId);
        toast({ title: TOAST_MESSAGES.CLOCK_IN_SUCCESS(employee?.name || 'empleado') });
      } catch(err) {
        toast({ title: TOAST_MESSAGES.ERROR_TITLE, description: TOAST_MESSAGES.CLOCK_IN_ERROR, variant: "destructive" });
      }
  }
  
  const handleClockInWarningConfirm = async () => {
    if (pendingClockInData) {
        try {
            setShowClockInWarning(false);
            await proceedWithClockIn(pendingClockInData.employeeId);
        } catch (error) {
             toast({ title: TOAST_MESSAGES.ERROR_TITLE, description: TOAST_MESSAGES.ACTION_ERROR, variant: "destructive" });
        } finally {
            setPendingClockInData(null);
        }
    }
  }

  const handleClockAction = async (employeeId: string, type: 'ENTRADA' | 'SALIDA') => {
    if (pendingClockIn) {
      toast({ title: TOAST_MESSAGES.ACTION_NOT_ALLOWED_TITLE, description: TOAST_MESSAGES.PENDING_CLOCK_IN_DESCRIPTION, variant: "destructive" });
      return;
    }

    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    if (type === 'SALIDA') {
      const employeeLogs = displayLogs.filter(log => log.employeeId === employeeId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const lastLog = employeeLogs[0];

      if (!lastLog || lastLog.type === 'SALIDA') {
        setShowTurnCompletedWarning(true);
        return;
      }
      if (differenceInMinutes(new Date(), new Date(lastLog.timestamp)) > MAX_SHIFT_MINUTES) {
        setShowLongTurnWarning(true);
        return;
      }

      // --- Optimistic SALIDA ---
      const tempId = `temp-salida-${Date.now()}`;
      const optimisticSalida: TimeLog = {
        id: tempId,
        employeeId,
        timestamp: new Date().toISOString(),
        type: 'SALIDA',
        source: 'Automático',
        row: -1, // Placeholder
      };

      const previousLogs = displayLogs; // Store current logs for potential revert
      setDisplayLogs(prevLogs => [optimisticSalida, ...prevLogs]); // Optimistic update

      try {
        // Construct rowData for addRow
        const rowData = [
          optimisticSalida.timestamp,
          `'${optimisticSalida.employeeId}`,
          employee.name,
          optimisticSalida.type,
          optimisticSalida.source
        ];
        await apiService.addRow(LOG_SHEET_NAME, rowData);
        reloadShifts(); // Sync with server for final consistency
        toast({ title: TOAST_MESSAGES.CLOCK_OUT_SUCCESS(employee.name) });
      } catch (error) {
        toast({ title: TOAST_MESSAGES.NETWORK_ERROR_TITLE, description: TOAST_MESSAGES.CLOCK_OUT_ERROR, variant: "destructive" });
        setDisplayLogs(previousLogs); // Revert on failure
      }
      return;
    }

    if (type === 'ENTRADA') {
      const employeeLogs = displayLogs.filter(log => log.employeeId === employeeId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const lastLog = employeeLogs[0];

      if (lastLog && lastLog.type === 'ENTRADA') {
        toast({ title: TOAST_MESSAGES.ERROR_TITLE, description: TOAST_MESSAGES.ALREADY_CLOCKED_IN, variant: "destructive" });
        return;
      }
      if (lastLog && lastLog.type === 'SALIDA' && differenceInMinutes(new Date(), new Date(lastLog.timestamp)) < FAST_CLOCK_IN_THRESHOLD_MINUTES) {
        setLastClockOutTime(format(new Date(lastLog.timestamp), 'p'));
        setPendingClockInData({ employeeId, type });
        setShowClockInWarning(true);
        return;
      }

      const tempId = `temp-${Date.now()}`;
      const optimisticLog: TimeLog = {
        id: tempId,
        employeeId,
        timestamp: new Date().toISOString(),
        type: 'ENTRADA',
        source: 'Automático',
        row: -1,
        isPending: true,
      };

      setDisplayLogs(prevLogs => [optimisticLog, ...prevLogs]); // Optimistic update

      const timerId = setTimeout(() => {
        setDisplayLogs(prev => prev.map(l => l.id === tempId ? { ...l, isPending: false } : l)); // Update isPending status
        setPendingClockIn(null);
        reloadShifts();
      }, 180000);

      setPendingClockIn({ tempId, timerId });
      toast({ title: TOAST_MESSAGES.CLOCK_IN_SUCCESS(employee.name), description: "Puedes deshacer la acción en 3 minutos." });

      try {
        // Construct rowData for addRow
        const rowData = [
          optimisticLog.timestamp,
          `'${optimisticLog.employeeId}`,
          employee.name,
          optimisticLog.type,
          optimisticLog.source
        ];
        const realLog = await apiService.addRow(LOG_SHEET_NAME, rowData);
        setPendingClockIn(null); // Clear pendingClockIn immediately after successful API call
        setDisplayLogs(prev => prev.map(l => l.id === tempId ? { ...l, row: realLog.newRow, isPending: false } : l)); // Update row and set isPending to false
        reloadShifts(); // Call reloadShifts immediately after successful API call
      } catch (error) {
        toast({ title: TOAST_MESSAGES.NETWORK_ERROR_TITLE, description: TOAST_MESSAGES.CLOCK_IN_UNDO_ERROR, variant: "destructive" });
        clearTimeout(timerId);
        setDisplayLogs(prevLogs => prevLogs.filter(log => log.id !== tempId)); // Revert on failure
        setPendingClockIn(null);
      }
    }
  };

  return {
    displayLogs, // Added this
    handleClockAction,
    handleCancelClockIn,
    handleClockInWarningConfirm,
    showClockInWarning,
    setShowClockInWarning,
    pendingClockInData,
    lastClockOutTime,
    showTurnCompletedWarning,
    setShowTurnCompletedWarning,
    showLongTurnWarning,
    setShowLongTurnWarning,
  };
};