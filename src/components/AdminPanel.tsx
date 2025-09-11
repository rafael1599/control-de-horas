import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddEmployeeForm from './admin/AddEmployeeForm';
import EmployeesTable from './admin/EmployeesTable';
import ShiftsTable from './admin/ShiftsTable';
import WeeklySummary from './admin/WeeklySummary';
import { useEmployees } from '@/contexts/EmployeesContext';
import { useShifts } from '@/contexts/ShiftsContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Employee } from '@/types'; // Import Employee type

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [selectedEmployeeToEdit, setSelectedEmployeeToEdit] = useState<Employee | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
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
          <TabsTrigger value="employees">Equipo</TabsTrigger>
          <TabsTrigger value="logs">Actividad</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <AddEmployeeForm
            onAddEmployee={addEmployee}
            onUpdateEmployee={updateEmployee} // ADDED: Pass the updateEmployee function
            loading={loading}
            employeeToEdit={selectedEmployeeToEdit}
            onCancelEdit={() => setSelectedEmployeeToEdit(null)}
            employees={employees} // ADDED: Pass the employees array
          />
          <EmployeesTable
            employees={employees}
            onUpdateEmployee={updateEmployee} // This prop is no longer used by EmployeesTable, but keeping it for now.
            onDeleteEmployee={deleteEmployee}
            onSelectEmployeeForEdit={(employee) => {
              setSelectedEmployeeToEdit(employee);
              console.log('Selected employee for edit:', employee);
            }} // ADDED
          />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <WeeklySummary 
            employees={employees} 
            logs={shifts}
            selectedEmployeeId={selectedEmployeeId}
            onEmployeeSelect={setSelectedEmployeeId}
          />
          <ShiftsTable 
            logs={shifts} 
            employees={employees} 
            onUpdateShift={updateShift}
            onCorrectionComplete={() => {
              reloadShifts();
              setSelectedEmployeeId(null); // Limpiar filtro al recargar
            }}
            filterByEmployeeId={selectedEmployeeId}
            onClearFilter={() => setSelectedEmployeeId(null)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
