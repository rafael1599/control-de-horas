
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
}

const EmployeesTable: React.FC<EmployeesTableProps> = ({ employees, onUpdateEmployee, onDeleteEmployee }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Employee>>({});

  const startEdit = (employee: Employee) => {
    setEditingId(employee.id);
    setEditData({
      employee_code: employee.employee_code,
      full_name: employee.full_name,
      hourly_rate: employee.hourly_rate,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = async () => {
    if (!editingId) return;
    // Filtrar valores undefined para no enviar data innecesaria
    const finalData = Object.fromEntries(
      Object.entries(editData).filter(([, value]) => value !== undefined)
    );
    await onUpdateEmployee(editingId, finalData);
    cancelEdit();
  };

  const handleInputChange = (field: keyof typeof editData, value: string | number | null) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  }

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
            <TableRow key={employee.id}>
              <TableCell>
                {editingId === employee.id ? (
                  <Input
                    value={editData.employee_code || ''}
                    onChange={(e) => handleInputChange('employee_code', e.target.value)}
                    placeholder="Opcional"
                  />
                ) : (
                  employee.employee_code || '--'
                )}
              </TableCell>
              <TableCell>
                {editingId === employee.id ? (
                  <Input
                    value={editData.full_name || ''}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                  />
                ) : (
                  employee.full_name
                )}
              </TableCell>
              <TableCell>
                {editingId === employee.id ? (
                  <Input
                    type="number"
                    value={editData.hourly_rate ?? ''}
                    onChange={(e) => handleInputChange('hourly_rate', e.target.value ? Number(e.target.value) : null)}
                  />
                ) : (
                  employee.hourly_rate ? `$${employee.hourly_rate.toFixed(2)}` : 'N/A'
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2 justify-end">
                  {editingId === employee.id ? (
                    <>
                      <Button size="sm" onClick={handleSave}><Save className="h-4 w-4" /></Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}><X className="h-4 w-4" /></Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => startEdit(employee)}>
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
