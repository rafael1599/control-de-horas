import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useWeeklyDashboard } from '@/hooks/useWeeklyDashboard';
import { type Employee, type TimeLog } from '@/services/api';

interface WeeklyDashboardProps {
  employees: Employee[];
  logs: TimeLog[];
}

const WeeklyDashboard: React.FC<WeeklyDashboardProps> = ({ employees, logs }) => {
  const {
    weeklyData,
    openShifts,
    weekDisplay,
    weekOffset,
    goToPreviousWeek,
    goToNextWeek,
  } = useWeeklyDashboard(employees, logs);

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
      {/* Active Shifts Section */}
      {openShifts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-slate-800">Turnos Activos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {openShifts.map(shift => (
              <div key={shift.employeeId} className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                <p className="font-semibold text-blue-900">{shift.employeeName}</p>
                <div className="flex items-center gap-2 text-blue-700 mt-1">
                  <Clock className="h-4 w-4" />
                  <p className="font-mono text-lg">{shift.liveDuration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Summary Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Resumen Semanal</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-slate-600 text-center w-32">{weekDisplay}</span>
            <Button variant="outline" size="icon" onClick={goToNextWeek} disabled={weekOffset === 0}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {weeklyData.length === 0 ? (
          <p className="text-gray-500">No hay registros cerrados para esta semana.</p>
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
                  <TableCell>${Math.round(hours * employee.rate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default WeeklyDashboard;
