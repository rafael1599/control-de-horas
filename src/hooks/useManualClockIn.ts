import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { type Employee } from '@/types';
import { differenceInMinutes } from 'date-fns';
import { useEmployees } from '@/contexts/EmployeesContext';
import { useShifts } from '@/contexts/ShiftsContext';
import { LOG_SHEET_NAME } from '@/config/sheets';
import { isShiftDurationValid, MAX_SHIFT_HOURS, MAX_SHIFT_MINUTES } from '@/lib/validators';
import { TOAST_MESSAGES } from '@/lib/messages';

interface UseManualClockInProps {
  employees: Employee[];
}

export const useManualClockIn = ({ employees }: UseManualClockInProps) => {
  const { toast } = useToast();
  const { reloadEmployees } = useEmployees();
  const { reloadShifts } = useShifts();

  const [showManualClockIn, setShowManualClockIn] = useState(false);
  const [employeeForManualClockIn, setEmployeeForManualClockIn] = useState<string | null>(null);
  const [manualClockInTime, setManualClockInTime] = useState<Date | undefined>(undefined);

  const handleManualClockInSubmit = async () => {
    if (!employeeForManualClockIn || !manualClockInTime) {
      toast({ title: TOAST_MESSAGES.ERROR_TITLE, description: TOAST_MESSAGES.MANUAL_CLOCK_IN_MISSING_TIME, variant: "destructive" });
      return;
    }

    const currentExitTime = new Date();
    if (!isShiftDurationValid(manualClockInTime, currentExitTime)) {
      toast({ title: TOAST_MESSAGES.VALIDATION_ERROR_TITLE, description: TOAST_MESSAGES.EXIT_TIME_BEFORE_ENTRY_ERROR, variant: "destructive" });
      return;
    }
    if (differenceInMinutes(currentExitTime, manualClockInTime) > MAX_SHIFT_MINUTES) {
      toast({ title: TOAST_MESSAGES.VALIDATION_ERROR_TITLE, description: TOAST_MESSAGES.SHIFT_DURATION_EXCEEDED(MAX_SHIFT_HOURS), variant: "destructive" });
      return;
    }

    try {
      setShowManualClockIn(false);
      const employee = employees.find(e => e.id === employeeForManualClockIn);
      if (!employee) {
        toast({ title: TOAST_MESSAGES.ERROR_TITLE, description: TOAST_MESSAGES.EMPLOYEE_NOT_FOUND, variant: "destructive" });
        return;
      }

      // Add ENTRADA log
      const entryRowData = [
        manualClockInTime!.toISOString(),
        `'${employeeForManualClockIn}`,
        employee.name,
        'ENTRADA',
        'Manual'
      ];
      await apiService.addRow(LOG_SHEET_NAME, entryRowData);

      // Add SALIDA log
      const exitRowData = [
        currentExitTime.toISOString(),
        `'${employeeForManualClockIn}`,
        employee.name,
        'SALIDA',
        'Automático'
      ];
      await apiService.addRow(LOG_SHEET_NAME, exitRowData);

      reloadShifts();
      reloadEmployees();
      toast({ title: TOAST_MESSAGES.SUCCESS_TITLE, description: TOAST_MESSAGES.MANUAL_CLOCK_IN_SUCCESS(employee?.name || 'empleado') });
    } catch (error) {
        toast({ title: TOAST_MESSAGES.ERROR_TITLE, description: TOAST_MESSAGES.MANUAL_CLOCK_IN_ERROR, variant: "destructive" });
    } finally {
        setEmployeeForManualClockIn(null);
        setManualClockInTime(undefined);
    }
  };

  return {
    showManualClockIn,
    setShowManualClockIn,
    employeeForManualClockIn,
    setEmployeeForManualClockIn,
    manualClockInTime,
    setManualClockInTime,
    handleManualClockInSubmit,
  };
};