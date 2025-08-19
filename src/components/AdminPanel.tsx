import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddEmployeeForm from './admin/AddEmployeeForm';
import EmployeesTable from './admin/EmployeesTable';
import ShiftsTable from './admin/ShiftsTable';
import { useEmployees } from '@/contexts/EmployeesContext';
import { useShifts } from '@/contexts/ShiftsContext';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const {
    employees,
    loading: loadingEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployees();

  const {
    shifts,
    loading: loadingShifts,
    updateShift,
    reloadShifts,
  } = useShifts();

  const loading = loadingEmployees || loadingShifts;

  if (loading && employees.length === 0) { // Improved loading state
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Panel Administrador</h1>
        <Button onClick={onBack} variant="outline">Volver</Button>
      </div>

      <Tabs defaultValue="logs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="employees">Empleados</TabsTrigger>
          <TabsTrigger value="logs">Registros</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <AddEmployeeForm onAddEmployee={addEmployee} loading={loading} />
          <EmployeesTable 
            employees={employees} 
            onUpdateEmployee={updateEmployee} 
            onDeleteEmployee={deleteEmployee} 
          />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <ShiftsTable 
            logs={shifts} 
            employees={employees} 
            onUpdateShift={updateShift}
            onCorrectionComplete={reloadShifts}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
