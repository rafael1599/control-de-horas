import React, { useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Employee } from '@/types';
import { useShifts } from '@/contexts/ShiftsContext';

interface EmployeeClockInProps {
  employees: Employee[];
  onClockAction: (employeeId: string, currentStatus: 'in' | 'out') => void;
}

export const EmployeeClockIn: React.FC<EmployeeClockInProps> = ({ employees, onClockAction }) => {
  const { openShifts } = useShifts();

  const { clockedInEmployees, clockedOutEmployees } = useMemo(() => {
    const clockedInIds = new Set(openShifts.map(s => s.employeeId));
    // The `openShifts` array already contains the employees with active shifts,
    // including their names and live durations.
    const clockedIn = openShifts; 
    const clockedOut = employees.filter(emp => !clockedInIds.has(emp.id));
    return { clockedInEmployees: clockedIn, clockedOutEmployees: clockedOut };
  }, [employees, openShifts]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Active Shifts Panel */}
      <Card>
        <CardHeader>
          <CardTitle>¿Quién está activo?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {clockedInEmployees.length > 0 ? (
            clockedInEmployees.map((shift) => (
              <div key={shift.employeeId} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">{shift.employeeName}</p>
                  <p className="text-sm text-gray-500">Duración: {shift.liveDuration}</p>
                </div>
                <Button
                  variant="destructive"
                  className="px-6 py-4"
                  onClick={() => onClockAction(shift.employeeId, 'out')}
                >
                  Salir
                </Button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No hay nadie activo en este momento.</p>
          )}
        </CardContent>
      </Card>

      {/* Available to Clock In Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Disponibles para entrar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {clockedOutEmployees.length > 0 ? (
            clockedOutEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                <p className="font-semibold">{employee.full_name}</p>
                <Button
                  variant="default"
                  className="px-6 py-4 bg-green-600 hover:bg-green-700"
                  onClick={() => onClockAction(employee.id, 'in')}
                >
                  Entrar
                </Button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">Todo el equipo tiene un turno activo.</p>
          )}
        </CardContent>
      </Card>

    </div>
  );
};
