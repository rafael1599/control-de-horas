import { useState, useMemo, useEffect } from 'react';
import { startOfWeek, endOfWeek, addWeeks, format, set, differenceInSeconds } from 'date-fns';
import { es } from 'date-fns/locale';
import { type Employee, type TimeLog, type OpenShift } from '@/types';
import { useEmployees } from '@/contexts/EmployeesContext';
import { useShifts } from '@/contexts/ShiftsContext';


// Helper to get the start of our specific week (Monday 7 AM)
const getCustomWeekStart = (date: Date): Date => {
  let start = startOfWeek(date, { weekStartsOn: 1 }); // weekStartsOn: 1 for Monday
  start = set(start, { hours: 7, minutes: 0, seconds: 0, milliseconds: 0 });
  return start;
};

// Helper to format duration in HH:MM:SS
const formatDuration = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const useWeeklyDashboard = () => {
  const { employees } = useEmployees();
  const { shifts: logs } = useShifts();

  const [weekOffset, setWeekOffset] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const { weeklyData, openShifts } = useMemo(() => {
    if (!logs || !employees) return { weeklyData: [], openShifts: [] };

    const filteredLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= weekStart && logDate < weekEnd;
    });

    const employeeMap = new Map(employees.map(e => [e.id, e]));
    const employeeHours: Record<string, { hours: number; employee: Employee }> = {};
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
            employeeHours[log.employeeId] = { hours: 0, employee };
          }
          employeeHours[log.employeeId].hours += hours;
          currentOpenShifts.delete(log.employeeId);
        }
      }
    });

    const openShiftsData: OpenShift[] = [];
    currentOpenShifts.forEach((entryTimestamp, employeeId) => {
      const employee = employeeMap.get(employeeId);
      if (employee) {
        const totalSeconds = differenceInSeconds(currentTime, entryTimestamp);
        openShiftsData.push({
          employeeId,
          employeeName: employee.name,
          entryTimestamp,
          liveDuration: formatDuration(totalSeconds),
        });
      }
    });

    return {
      weeklyData: Object.values(employeeHours).sort((a, b) => b.hours - a.hours),
      openShifts: openShiftsData,
    };

  }, [logs, employees, weekStart, weekEnd, currentTime]);

  return {
    weeklyData,
    openShifts,
    weekDisplay,
    weekOffset,
    goToPreviousWeek,
    goToNextWeek,
  };
};