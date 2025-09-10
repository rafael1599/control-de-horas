import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Employee } from '@/types';
import { useShifts } from '@/contexts/ShiftsContext';

interface EmployeeClockInProps {
  employees: Employee[];
  onClockAction: (employeeId: string, currentStatus: 'in' | 'out') => void;
}

export const EmployeeClockIn: React.FC<EmployeeClockInProps> = ({ employees, onClockAction }) => {
  const { openShifts } = useShifts();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>('');

  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
  const isClockedIn = selectedEmployee ? openShifts.some(shift => shift.employeeId === selectedEmployee.id) : false;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fichaje Diario</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un empleado" />
            </SelectTrigger>
            <SelectContent>
              {employees.map(emp => (
                <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedEmployeeId && (
            <div className="flex items-center justify-center gap-4 p-2 border rounded-md">
              <span className="font-medium">{selectedEmployee?.full_name}</span>
              {isClockedIn ? (
                <Button
                  variant="destructive"
                  onClick={() => onClockAction(selectedEmployeeId, 'out')}
                >
                  Salir
                </Button>
              ) : (
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => onClockAction(selectedEmployeeId, 'in')}
                >
                  Entrar
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
