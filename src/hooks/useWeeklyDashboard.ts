import { useState, useMemo } from 'react';
import { startOfWeek, endOfWeek, addWeeks, format, set } from 'date-fns';
import { es } from 'date-fns/locale';
import { type Employee, type TimeLog } from '@/types';
import { useEmployees } from '@/contexts/EmployeesContext';
import { useShifts } from '@/contexts/ShiftsContext';

// Helper to get the start of our specific week (Monday 7 AM)
const getCustomWeekStart = (date: Date): Date => {
  let start = startOfWeek(date, { weekStartsOn: 1 }); // weekStartsOn: 1 for Monday
  start = set(start, { hours: 7, minutes: 0, seconds: 0, milliseconds: 0 });
  return start;
};

export const useWeeklyDashboard = () => {
  const { employees } = useEmployees();
  const { shifts: logs, openShifts } = useShifts(); // Get openShifts from context

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
    const employeeHours: Record<string, { hours: number; employee: Employee; estimatedPayment: number }> = {};
    const currentOpenShifts = new Map<string, Date>();

    const sortedLogs = filteredLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    sortedLogs.forEach(log => {
      const employee = employeeMap.get(log.employeeId);
      if (!employee) return;

      if (log.type === 'ENTRADA') {
        currentOpenShifts.set(log.employeeId, new Date(log.timestamp));
      } else if (log.type === 'SALIDA') {
        if (currentOpenShifts.has(log.employeeId)) {
          const entryTime = currentOpenShifts.get(log.employeeId)!;
          const exitTime = new Date(log.timestamp);
          const hours = (exitTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60);
          
          if (!employeeHours[log.employeeId]) {
            employeeHours[log.employeeId] = { hours: 0, employee, estimatedPayment: 0 }; // Initialize estimatedPayment
          }
          employeeHours[log.employeeId].hours += hours;
          employeeHours[log.employeeId].estimatedPayment = employeeHours[log.employeeId].hours * (employee.hourly_rate || 0); // Calculate estimatedPayment
          currentOpenShifts.delete(log.employeeId);
        }
      }
    });

    return Object.values(employeeHours).sort((a, b) => b.hours - a.hours);

  }, [logs, employees, weekStart, weekEnd]);

  return {
    weeklyData,
    openShifts, // Return openShifts from context
    weekDisplay,
    weekOffset,
    goToPreviousWeek,
    goToNextWeek,
  };
};