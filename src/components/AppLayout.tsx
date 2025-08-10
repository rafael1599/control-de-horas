import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import EmployeeClockIn from './EmployeeClockIn';
import WeeklyDashboard from './WeeklyDashboard';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';
import { apiService, Employee, TimeLog } from '@/services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AppLayout: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showManualClockIn, setShowManualClockIn] = useState(false);
  const [employeeForManualClockIn, setEmployeeForManualClockIn] = useState<string | null>(null);
  const [manualClockInTime, setManualClockInTime] = useState('');
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
      
      const employeeLogs = logs.filter(log => log.employeeId === employeeId);
      const lastLog = employeeLogs[employeeLogs.length - 1];
      
      if (type === 'SALIDA' && (!lastLog || lastLog.type === 'SALIDA')) {
        setEmployeeForManualClockIn(employeeId);
        setShowManualClockIn(true);
        setLoading(false);
        return;
      }
      
      if (type === 'ENTRADA' && lastLog && lastLog.type === 'ENTRADA') {
        toast({
          title: "Error", 
          description: "Ya hay una entrada abierta para este empleado",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      await apiService.addLog(employeeId, type, undefined, 'Automático');
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

  const handleManualClockInSubmit = async () => {
    if (!employeeForManualClockIn || !manualClockInTime) {
      toast({
        title: "Error",
        description: "Por favor ingresa la hora de entrada",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      // Add the manual clock-in
      await apiService.addLog(employeeForManualClockIn, 'ENTRADA', new Date(manualClockInTime).toISOString(), 'Manual');
      
      // Immediately add the clock-out
      await apiService.addLog(employeeForManualClockIn, 'SALIDA', new Date().toISOString(), 'Automático');
      
      await loadData();
      const employee = employees.find(e => e.id === employeeForManualClockIn);
      toast({
        title: "Éxito",
        description: `Entrada manual y salida registrada para ${employee?.name}`,
      });
    } catch (error) {
        toast({
            title: "Error",
            description: "No se pudo registrar la entrada manual",
            variant: "destructive"
        });
    } finally {
        setShowManualClockIn(false);
        setEmployeeForManualClockIn(null);
        setManualClockInTime('');
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
      <Dialog open={showManualClockIn} onOpenChange={setShowManualClockIn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entrada Manual Olvidada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>No se encontró una entrada abierta. Por favor, ingresa la hora de entrada para registrar tu salida.</p>
            <Input
              type="datetime-local"
              value={manualClockInTime}
              onChange={(e) => setManualClockInTime(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManualClockIn(false)}>Cancelar</Button>
            <Button onClick={handleManualClockInSubmit}>Registrar Entrada y Salida</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppLayout;