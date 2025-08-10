import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Employee {
  id: string;
  name: string;
  rate: number;
}

interface TimeLog {
  timestamp: string;
  employeeId: string;
  type: 'ENTRADA' | 'SALIDA';
  source: string;
  row: number;
}

interface WeeklyDashboardProps {
  employees: Employee[];
  logs: TimeLog[];
}

const WeeklyDashboard: React.FC<WeeklyDashboardProps> = ({ employees, logs }) => {
  const getWeeklyHours = () => {
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    currentWeekStart.setHours(0, 0, 0, 0);

    const employeeHours: Record<string, { hours: number; employee: Employee }> = {};

    // Group logs by employee
    const employeeLogs: Record<string, TimeLog[]> = {};
    logs.forEach(log => {
      const logDate = new Date(log.timestamp);
      if (logDate >= currentWeekStart) {
        if (!employeeLogs[log.employeeId]) {
          employeeLogs[log.employeeId] = [];
        }
        employeeLogs[log.employeeId].push(log);
      }
    });

    // Calculate hours for each employee
    Object.entries(employeeLogs).forEach(([employeeId, empLogs]) => {
      const employee = employees.find(e => e.id === employeeId);
      if (!employee) return;

      empLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      let totalHours = 0;
      let lastEntry: Date | null = null;

      empLogs.forEach(log => {
        if (log.type === 'ENTRADA') {
          lastEntry = new Date(log.timestamp);
        } else if (log.type === 'SALIDA' && lastEntry) {
          const exit = new Date(log.timestamp);
          const hours = (exit.getTime() - lastEntry.getTime()) / (1000 * 60 * 60);
          totalHours += hours;
          lastEntry = null;
        }
      });

      if (totalHours > 0) {
        employeeHours[employeeId] = { hours: totalHours, employee };
      }
    });

    return Object.values(employeeHours).sort((a, b) => b.hours - a.hours);
  };

  const weeklyData = getWeeklyHours();

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-slate-800">Resumen Semanal</h2>
      
      {weeklyData.length === 0 ? (
        <p className="text-gray-500">No hay registros para esta semana</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Horas</TableHead>
              <TableHead>Pago Estimado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weeklyData.map(({ employee, hours }) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell>{hours.toFixed(2)}</TableCell>
                <TableCell>${(hours * employee.rate).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default WeeklyDashboard;