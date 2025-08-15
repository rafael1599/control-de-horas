import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit } from 'lucide-react';
import { type Employee } from '@/types';

interface EmployeesTableProps {
  employees: Employee[];
  onUpdateEmployee: (employee: Employee) => Promise<void>;
  onDeleteEmployee: (id: string) => Promise<void>;
}

const EmployeesTable: React.FC<EmployeesTableProps> = ({ employees, onUpdateEmployee, onDeleteEmployee }) => {
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [editEmployee, setEditEmployee] = useState<Employee>({ id: '', name: '', rate: 0 });

  const startEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee.id);
    setEditEmployee(employee);
  };

  const saveEmployee = async () => {
    await onUpdateEmployee(editEmployee);
    setEditingEmployee(null);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Tarifa</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>{employee.id}</TableCell>
              <TableCell>
                {editingEmployee === employee.id ? (
                  <Input
                    value={editEmployee.name}
                    onChange={(e) => setEditEmployee({...editEmployee, name: e.target.value})}
                  />
                ) : (
                  employee.name
                )}
              </TableCell>
              <TableCell>
                {editingEmployee === employee.id ? (
                  <Input
                    type="number"
                    value={editEmployee.rate}
                    onChange={(e) => setEditEmployee({...editEmployee, rate: Number(e.target.value)})}
                  />
                ) : (
                  `$${employee.rate}`
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {editingEmployee === employee.id ? (
                    <>
                      <Button size="sm" onClick={saveEmployee}>Guardar</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingEmployee(null)}>Cancelar</Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => startEditEmployee(employee)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onDeleteEmployee(employee.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmployeesTable;