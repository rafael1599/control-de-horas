import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  rate: number;
}

interface EmployeeClockInProps {
  employees: Employee[];
  onClockAction: (employeeId: string, type: 'ENTRADA' | 'SALIDA') => Promise<void>;
  loading: boolean;
}

const EmployeeClockIn: React.FC<EmployeeClockInProps> = ({ 
  employees, 
  onClockAction, 
  loading 
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const { toast } = useToast();

  const handleClockIn = async () => {
    if (!selectedEmployee) {
      toast({
        title: "Error",
        description: "Por favor selecciona un empleado",
        variant: "destructive"
      });
      return;
    }
    await onClockAction(selectedEmployee, 'ENTRADA');
  };

  const handleClockOut = async () => {
    if (!selectedEmployee) {
      toast({
        title: "Error", 
        description: "Por favor selecciona un empleado",
        variant: "destructive"
      });
      return;
    }
    await onClockAction(selectedEmployee, 'SALIDA');
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-slate-800">Control Horario</h2>
      
      <div className="space-y-4">
        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona tu nombre" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-4">
          <Button 
            onClick={handleClockIn}
            disabled={loading || !selectedEmployee}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar ENTRADA
          </Button>
          
          <Button 
            onClick={handleClockOut}
            disabled={loading || !selectedEmployee}
            variant="destructive"
            className="flex-1"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar SALIDA
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeClockIn;