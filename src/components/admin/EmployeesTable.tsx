
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Save, X } from 'lucide-react';
import { type Employee } from '@/types';

interface EmployeesTableProps {
  employees: Employee[];
  onUpdateEmployee: (employeeId: string, data: Partial<Employee>) => Promise<void>;
  onDeleteEmployee: (id: string) => Promise<void>;
  onSelectEmployeeForEdit: (employee: Employee) => void;
}

const EmployeesTable: React.FC<EmployeesTableProps> = ({ employees, onDeleteEmployee, onSelectEmployeeForEdit }) => {

  return (
    <div className="bg-card border rounded-lg shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className="w-[120px]">Tarifa/hr</TableHead>
            <TableHead className="w-[150px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} onClick={() => onSelectEmployeeForEdit(employee)} className="cursor-pointer hover:bg-gray-100">
              <TableCell>
                {employee.employee_code || '--'}
              </TableCell>
              <TableCell>
                {employee.full_name}
              </TableCell>
              <TableCell>
                {employee.hourly_rate ? `${employee.hourly_rate.toFixed(2)}` : 'N/A'}
              </TableCell>
              <TableCell>
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); onDeleteEmployee(employee.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
