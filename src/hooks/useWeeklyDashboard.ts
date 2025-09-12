import { useState, useMemo } from 'react';
import { startOfWeek, endOfWeek, addWeeks, format, set, differenceInMilliseconds } from 'date-fns';
import { es } from 'date-fns/locale';
import { type Employee, type TimeLog, type ProcessedShift } from '@/types';
import { useEmployees } from '@/contexts/EmployeesContext';
import { useShifts } from '@/contexts/ShiftsContext';

// Helper to get the start of our specific week (Monday 7 AM)
const getCustomWeekStart = (date: Date): Date => {
  let start = startOfWeek(date, { weekStartsOn: 1 }); // weekStartsOn: 1 for Monday
  start = set(start, { hours: 7, minutes: 0, seconds: 0, milliseconds: 0 });
  return start;
};

export const useWeeklyDashboard = (employees: Employee[], logs: TimeLog[]) => {
  const [weekOffset, setWeekOffset] = useState(0);

  const goToPreviousWeek = () => setWeekOffset(prev => prev - 1);
  const goToNextWeek = () => setWeekOffset(prev => (prev < 0 ? prev + 1 : 0));

  const { weekStart, weekEnd, weekDisplay } = useMemo(() => {
    const now = new Date();
    const referenceDate = addWeeks(now, weekOffset);
    const weekStartDate = getCustomWeekStart(referenceDate);
    const weekEndDateForFilter = addWeeks(weekStartDate, 1);
    const weekEndDateForDisplay = endOfWeek(referenceDate, { weekStartsOn: 1 });
    
    const displayFormat = 'd MMM';
    const display = `${format(weekStartDate, displayFormat, { locale: es })} - ${format(weekEndDateForDisplay, displayFormat, { locale: es })}`;

    return { weekStart: weekStartDate, weekEnd: weekEndDateForFilter, weekDisplay: display };
  }, [weekOffset]);

  const weeklyData = useMemo(() => {
    if (!logs || !employees) return [];

    const filteredLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= weekStart && logDate < weekEnd;
    });

    const employeeMap = new Map(employees.map(e => [e.id, e]));
    const openShifts = new Map<string, TimeLog>();
    const shiftsInWeek: ProcessedShift[] = [];

    const sortedLogs = filteredLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    sortedLogs.forEach(log => {
      if (log.type === 'ENTRADA') {
        // Handle cases of multiple entries without exit
        if (openShifts.has(log.employeeId)) {
            // This is an anomalous situation, the previous shift is orphaned.
        }
        openShifts.set(log.employeeId, log);
      } else if (log.type === 'SALIDA') {
        if (openShifts.has(log.employeeId)) {
          const openShift = openShifts.get(log.employeeId)!;
          shiftsInWeek.push({
            id: openShift.shiftId!,
            employeeId: openShift.employeeId,
            employeeName: employeeMap.get(openShift.employeeId)?.full_name || openShift.employeeId,
            entryTimestamp: openShift.timestamp,
            exitTimestamp: log.timestamp,
                        duration: differenceInMilliseconds(new Date(log.timestamp), new Date(openShift.timestamp)) / (1000 * 60 * 60),
            entryRow: openShift.row,
            exitRow: log.row,
          });
          openShifts.delete(log.employeeId);
        }
      }
    });

    const employeeSummary: Record<string, {
      hours: number;
      employee: Employee;
      hasAnomalousShift: boolean;
      shifts: ProcessedShift[];
    }> = {};

    shiftsInWeek.forEach(shift => {
        const employee = employeeMap.get(shift.employeeId);
        if (!employee) return;

        if (!employeeSummary[shift.employeeId]) {
            employeeSummary[shift.employeeId] = { hours: 0, employee, hasAnomalousShift: false, shifts: [] };
        }

        const duration = shift.duration || 0;
        employeeSummary[shift.employeeId].hours += duration;
        employeeSummary[shift.employeeId].shifts.push(shift);

        if (duration > 18) {
            employeeSummary[shift.employeeId].hasAnomalousShift = true;
        }
    });
    
    // Sort shifts within each summary for chronological display
    Object.values(employeeSummary).forEach(summary => {
      summary.shifts.sort((a, b) => new Date(a.entryTimestamp).getTime() - new Date(b.entryTimestamp).getTime());
    });

    const summaryWithPayment = Object.values(employeeSummary).map(summary => ({
      ...summary,
      payment: summary.hours * (summary.employee.pay_rate || 0)
    }));

    // Sort by payment in descending order
    return summaryWithPayment.sort((a, b) => b.payment - a.payment);

  }, [logs, employees, weekStart, weekEnd]);

  const getShiftsForWeek = (employeeId: string): ProcessedShift[] => {
    // This function can be implemented if needed elsewhere, but we will do the logic inside the hook for now
    return [];
  }

  return {
    weeklyData,
    weekDisplay,
    weekOffset,
    goToPreviousWeek,
    goToNextWeek,
    getShiftsForWeek, // Returning for future use, though not used in WeeklySummary
  };
};