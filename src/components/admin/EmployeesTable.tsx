
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit } from 'lucide-react';
import { type Employee } from '@/types';

interface EmployeesTableProps {
  employees: Employee[];
  onUpdateEmployee: (employeeId: string, data: Partial<Employee>) => Promise<void>;
  onDeleteEmployee: (id: string) => Promise<void>;
  onSelectEmployeeForEdit: (employee: Employee) => void;
  onReactivateEmployee: (id: string) => Promise<void>;
  viewMode: 'active' | 'inactive';
}

const EmployeesTable: React.FC<EmployeesTableProps> = ({ employees, onDeleteEmployee, onSelectEmployeeForEdit, onReactivateEmployee, viewMode }) => {
  return (
    <div className="bg-card border rounded-lg shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Código</TableHead>
            <TableHead>Miembro</TableHead>
            <TableHead className="w-[120px]">Tarifa/hr</TableHead>
            <TableHead className="w-[150px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>{employee.employee_code || '--'}</TableCell>
              <TableCell>{employee.full_name}</TableCell>
              <TableCell>{employee.hourly_rate ? `${employee.hourly_rate.toFixed(2)}` : 'N/A'}</TableCell>
              <TableCell>
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => onSelectEmployeeForEdit(employee)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {viewMode === 'active' ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción desactivará al miembro y no podrá registrar horas. ¿Deseas continuar?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteEmployee(employee.id)}>
                            Continuar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button size="sm" variant="default" onClick={() => onReactivateEmployee(employee.id)}>
                      Reactivar
                    </Button>
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
