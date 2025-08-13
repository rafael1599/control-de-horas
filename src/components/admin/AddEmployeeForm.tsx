import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { Employee } from '@/services/api';

interface AddEmployeeFormProps {
  onAddEmployee: (employee: Omit<Employee, 'id'> & { id: string }) => Promise<void>;
  loading: boolean;
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({ onAddEmployee, loading }) => {
  const [newEmployee, setNewEmployee] = useState({ id: '', name: '', rate: 15 });
  const { toast } = useToast();

  const handleAddEmployee = async () => {
    if (!newEmployee.id || !newEmployee.name) {
      toast({
        title: "Error",
        description: "ID y nombre son requeridos",
        variant: "destructive"
      });
      return;
    }
    await onAddEmployee(newEmployee);
    setNewEmployee({ id: '', name: '', rate: 15 });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Agregar Empleado</h3>
      <div className="flex gap-2">
        <Input
          placeholder="ID"
          value={newEmployee.id}
          onChange={(e) => setNewEmployee({...newEmployee, id: e.target.value})}
        />
        <Input
          placeholder="Nombre"
          value={newEmployee.name}
          onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
        />
        <Input
          type="number"
          placeholder="Tarifa/hora"
          value={newEmployee.rate}
          onChange={(e) => setNewEmployee({...newEmployee, rate: Number(e.target.value)})}
        />
        <Button onClick={handleAddEmployee} disabled={loading}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AddEmployeeForm;