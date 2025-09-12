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
import { Employee } from '@/types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Plus } from 'lucide-react';
import AddShiftDialog from './admin/AddShiftDialog';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployeeToEdit, setSelectedEmployeeToEdit] = useState<Employee | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isShiftDetailsCollapsibleOpen, setIsShiftDetailsCollapsibleOpen] = useState(false);
  const [isAddShiftDialogOpen, setIsAddShiftDialogOpen] = useState(false);
  
  const { employees, loading: loadingEmployees, addEmployee, updateEmployee, deleteEmployee, statusFilter, setStatusFilter, reactivateEmployee } = useEmployees();
  const { shifts, loading: loadingShifts, updateShift, reloadShifts } = useShifts();

  const loading = loadingEmployees || loadingShifts;

  const handleAddNewMember = () => {
    setSelectedEmployeeToEdit(null);
    setIsFormOpen(true);
  };

  const handleSelectMemberForEdit = (employee: Employee) => {
    setSelectedEmployeeToEdit(employee);
    setIsFormOpen(true);
  };

  const handleFormSuccess = async (action: Promise<void>) => {
    await action;
    setIsFormOpen(false);
  };

  if (loading && employees.length === 0) {
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
          <div className="flex justify-between items-center">
            <Tabs defaultValue="active" onValueChange={(value) => setStatusFilter(value as 'active' | 'inactive')}>
              <TabsList>
                <TabsTrigger value="active">Activos</TabsTrigger>
                <TabsTrigger value="inactive">Inactivos</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button onClick={handleAddNewMember}>
              <Plus className="mr-2 h-4 w-4" />
              Añadir Miembro
            </Button>
          </div>
          <EmployeesTable
            employees={employees}
            onDeleteEmployee={deleteEmployee}
            onSelectEmployeeForEdit={handleSelectMemberForEdit}
            onReactivateEmployee={reactivateEmployee}
            viewMode={statusFilter}
          />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <WeeklySummary 
            employees={employees} 
            logs={shifts}
          />
          <div className="flex justify-end gap-2 mt-4">
            
            
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <AddEmployeeForm
            onAddEmployee={(data) => handleFormSuccess(addEmployee(data))}
            onUpdateEmployee={(id, data) => handleFormSuccess(updateEmployee(id, data))}
            loading={loading}
            employeeToEdit={selectedEmployeeToEdit}
            onCancelEdit={() => setIsFormOpen(false)}
            employees={employees}
          />
        </DialogContent>
      </Dialog>

      <Collapsible open={isShiftDetailsCollapsibleOpen} onOpenChange={setIsShiftDetailsCollapsibleOpen} className="w-full space-y-2">
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => setIsAddShiftDialogOpen(true)}>
            Añadir Turno
          </Button>
          <CollapsibleTrigger asChild>
            <Button>
              Ver Actividad Detallada
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-4">
          <ShiftsTable
            logs={shifts}
            employees={employees}
            onUpdateShift={updateShift}
            onCorrectionComplete={reloadShifts}
            filterByEmployeeId={selectedEmployeeId}
            onClearFilter={() => setSelectedEmployeeId(null)}
          />
        </CollapsibleContent>
      </Collapsible>

      <AddShiftDialog
        isOpen={isAddShiftDialogOpen}
        onClose={() => setIsAddShiftDialogOpen(false)}
        employees={employees}
      />
    </div>
  );
};

export default AdminPanel;