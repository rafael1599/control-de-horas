import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import EmployeeClockIn from './EmployeeClockIn';
import WeeklyDashboard from './WeeklyDashboard';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';
import { apiService, Employee, TimeLog } from '@/services/api';

const AppLayout: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiService.fetchData();
      setEmployees(data.employees);
      setLogs(data.logs);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClockAction = async (employeeId: string, type: 'ENTRADA' | 'SALIDA') => {
    try {
      setLoading(true);
      
      // Check for existing open entry
      const employeeLogs = logs.filter(log => log.employeeId === employeeId);
      const lastLog = employeeLogs[employeeLogs.length - 1];
      
      if (type === 'SALIDA' && (!lastLog || lastLog.type === 'SALIDA')) {
        toast({
          title: "Error",
          description: "No hay entrada registrada para este empleado",
          variant: "destructive"
        });
        return;
      }
      
      if (type === 'ENTRADA' && lastLog && lastLog.type === 'ENTRADA') {
        toast({
          title: "Error", 
          description: "Ya hay una entrada abierta para este empleado",
          variant: "destructive"
        });
        return;
      }

      await apiService.addLog(employeeId, type);
      await loadData();
      
      const employee = employees.find(e => e.id === employeeId);
      toast({
        title: "Éxito",
        description: `${type} registrada para ${employee?.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar la acción",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (employee: Employee) => {
    try {
      setLoading(true);
      await apiService.addEmployee(employee);
      await loadData();
      toast({
        title: "Éxito",
        description: "Empleado agregado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el empleado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmployee = async (employee: Employee) => {
    try {
      setLoading(true);
      await apiService.updateEmployee(employee);
      await loadData();
      toast({
        title: "Éxito",
        description: "Empleado actualizado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el empleado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este empleado?')) return;
    
    try {
      setLoading(true);
      await apiService.deleteEmployee(id);
      await loadData();
      toast({
        title: "Éxito",
        description: "Empleado eliminado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el empleado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLog = async (log: Partial<TimeLog> & { row: number }) => {
    try {
      setLoading(true);
      await apiService.updateLog(log);
      await loadData();
      toast({
        title: "Éxito",
        description: "Registro actualizado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el registro",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (row: number) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;
    
    try {
      setLoading(true);
      await apiService.deleteLog(row);
      await loadData();
      toast({
        title: "Éxito",
        description: "Registro eliminado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && employees.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2">Procesando...</p>
          </div>
        </div>
      )}

      <AdminLogin onLogin={() => setIsAdmin(true)} />

      <div className="container mx-auto p-4 space-y-6">
        {isAdmin ? (
          <AdminPanel
            employees={employees}
            logs={logs}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onUpdateLog={handleUpdateLog}
            onDeleteLog={handleDeleteLog}
            onBack={() => setIsAdmin(false)}
            loading={loading}
          />
        ) : (
          <>
            <EmployeeClockIn
              employees={employees}
              onClockAction={handleClockAction}
              loading={loading}
            />
            <WeeklyDashboard employees={employees} logs={logs} />
          </>
        )}
      </div>
      
      <Toaster />
    </div>
  );
};

export default AppLayout;
