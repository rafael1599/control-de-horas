import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Edit, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface AdminPanelProps {
  employees: Employee[];
  logs: TimeLog[];
  onAddEmployee: (employee: Omit<Employee, 'id'> & { id: string }) => Promise<void>;
  onUpdateEmployee: (employee: Employee) => Promise<void>;
  onDeleteEmployee: (id: string) => Promise<void>;
  onUpdateLog: (log: Partial<TimeLog> & { row: number }) => Promise<void>;
  onDeleteLog: (row: number) => Promise<void>;
  onBack: () => void;
  loading: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  employees,
  logs,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onUpdateLog,
  onDeleteLog,
  onBack,
  loading
}) => {
  const [newEmployee, setNewEmployee] = useState({ id: '', name: '', rate: 15 });
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [editEmployee, setEditEmployee] = useState<Employee>({ id: '', name: '', rate: 0 });
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

  const startEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee.id);
    setEditEmployee(employee);
  };

  const saveEmployee = async () => {
    await onUpdateEmployee(editEmployee);
    setEditingEmployee(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Panel Administrador</h1>
        <Button onClick={onBack} variant="outline">Volver</Button>
      </div>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="employees">Empleados</TabsTrigger>
          <TabsTrigger value="logs">Registros</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha/Hora</TableHead>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.slice(-50).reverse().map((log) => {
                  const employee = employees.find(e => e.id === log.employeeId);
                  return (
                    <TableRow key={`${log.row}-${log.timestamp}`}>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{employee?.name || log.employeeId}</TableCell>
                      <TableCell>{log.type}</TableCell>
                      <TableCell>{log.source}</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => onDeleteLog(log.row)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;