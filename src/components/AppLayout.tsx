import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import EmployeeClockIn from './EmployeeClockIn';
import WeeklyDashboard from './WeeklyDashboard';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';
// import { apiService } from '@/services/api';
import { type Employee, type TimeLog } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from './ui/DateTimePicker';
import { subHours, differenceInMinutes, format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees } from '@/contexts/EmployeesContext';
import { useShifts } from '@/contexts/ShiftsContext';
import { MAX_SHIFT_HOURS, MAX_SHIFT_MINUTES, FAST_CLOCK_IN_THRESHOLD_MINUTES } from '@/config/rules';

const AppLayout: React.FC = () => {
  const { isAdmin, logout } = useAuth();
  const { employees, loading: loadingEmployees, reloadEmployees } = useEmployees();
  const { shifts: logs, loading: loadingShifts, reloadShifts } = useShifts();
  const [showManualClockIn, setShowManualClockIn] = useState(false);
  const [employeeForManualClockIn, setEmployeeForManualClockIn] = useState<string | null>(null);
  const [manualClockInTime, setManualClockInTime] = useState<Date | undefined>(undefined);
  const [showClockInWarning, setShowClockInWarning] = useState(false);
  const [pendingClockInData, setPendingClockInData] = useState<{ employeeId: string, type: 'ENTRADA' | 'SALIDA' } | null>(null);
  const [lastClockOutTime, setLastClockOutTime] = useState<string>('');
  const [showTurnCompletedWarning, setShowTurnCompletedWarning] = useState(false);
  const [showLongTurnWarning, setShowLongTurnWarning] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { toast } = useToast();

  const overallLoading = loadingEmployees || loadingShifts || isActionLoading;

  const proceedWithClockIn = async (employeeId: string) => {
      // TODO: Migrar la lógica de addLog al nuevo servicio de API
      // await apiService.addLog(employeeId, 'ENTRADA', undefined, 'Automático');
      console.log("Lógica de 'addLog' pendiente de migración.", { employeeId, type: 'ENTRADA' });
      await reloadShifts();
      
      const employee = employees.find(e => e.id === employeeId);
      toast({
        title: "Éxito (Simulado)",
        description: `ENTRADA registrada para ${employee?.name}`,
      });
  }
  
  const handleClockInWarningConfirm = async () => {
    if (pendingClockInData) {
        setIsActionLoading(true);
        try {
            setShowClockInWarning(false);
            await proceedWithClockIn(pendingClockInData.employeeId);
        } catch (error) {
             toast({
                title: "Error",
                description: "No se pudo registrar la acción",
                variant: "destructive"
            });
        } finally {
            setPendingClockInData(null);
            setIsActionLoading(false);
        }
    }
  }

  const handleClockAction = async (employeeId: string, type: 'ENTRADA' | 'SALIDA') => {
    setIsActionLoading(true);
    try {
      const employeeLogs = logs.filter(log => log.employeeId === employeeId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const lastLog = employeeLogs[0];
      
      if (type === 'SALIDA') {
        if (!lastLog) {
            setEmployeeForManualClockIn(employeeId);
            setManualClockInTime(subHours(new Date(), 8));
            setShowManualClockIn(true);
        } else if (lastLog.type === 'SALIDA') {
            setShowTurnCompletedWarning(true);
        } else {
             if (differenceInMinutes(new Date(), new Date(lastLog.timestamp)) > MAX_SHIFT_MINUTES) {
                 setShowLongTurnWarning(true);
                 return;
             }
             
             // TODO: Migrar la lógica de addLog al nuevo servicio de API
             // await apiService.addLog(employeeId, 'SALIDA', undefined, 'Automático');
             console.log("Lógica de 'addLog' pendiente de migración.", { employeeId, type: 'SALIDA' });
             await reloadShifts();
             const employee = employees.find(e => e.id === employeeId);
             toast({
                title: "Éxito (Simulado)",
                description: `SALIDA registrada para ${employee?.name}`,
            });
        }
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
      
      if (type === 'ENTRADA' && lastLog && lastLog.type === 'SALIDA') {
          const minutesSinceLastClockOut = differenceInMinutes(new Date(), new Date(lastLog.timestamp));
          if (minutesSinceLastClockOut < FAST_CLOCK_IN_THRESHOLD_MINUTES) { 
              setLastClockOutTime(format(new Date(lastLog.timestamp), 'p'));
              setPendingClockInData({ employeeId, type });
              setShowClockInWarning(true);
              return;
          }
      }
      
      // TODO: Migrar la lógica de addLog al nuevo servicio de API
      // await apiService.addLog(employeeId, type, undefined, 'Automático');
      console.log("Lógica de 'addLog' pendiente de migración.", { employeeId, type });
      await reloadShifts();
      
      const employee = employees.find(e => e.id === employeeId);
      toast({
        title: "Éxito (Simulado)",
        description: `${type} registrada para ${employee?.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar la acción",
        variant: "destructive"
      });
    } finally {
        setIsActionLoading(false);
    }
  };

  const handleManualClockInSubmit = async () => {
    if (!employeeForManualClockIn || !manualClockInTime) {
      toast({
        title: "Error",
        description: "Por favor, selecciona una fecha y hora de entrada",
        variant: "destructive"
      });
      return;
    }

    setIsActionLoading(true);
    try {
      setShowManualClockIn(false);
      
      // TODO: Migrar la lógica de addLog al nuevo servicio de API
      // await apiService.addLog(employeeForManualClockIn, 'ENTRADA', manualClockInTime.toISOString(), 'Manual');
      // await apiService.addLog(employeeForManualClockIn, 'SALIDA', new Date().toISOString(), 'Automático');
      console.log("Lógica de 'addLog' pendiente de migración.", { employeeForManualClockIn, manualClockInTime });
      
      await reloadShifts();
      await reloadEmployees();
      const employee = employees.find(e => e.id === employeeForManualClockIn);
      toast({
        title: "Éxito (Simulado)",
        description: `Entrada manual y salida registrada para ${employee?.name}`,
      });
    } catch (error) {
        toast({
            title: "Error",
            description: "No se pudo registrar la entrada manual",
            variant: "destructive"
        });
    } finally {
        setEmployeeForManualClockIn(null);
        setManualClockInTime(undefined);
        setIsActionLoading(false);
    }
  };

  if (overallLoading && employees.length === 0 && !isAdmin) {
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
      {overallLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg text-center shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2">Procesando...</p>
          </div>
        </div>
      )}

      <AdminLogin />

      <div className="container mx-auto p-4 space-y-6">
        {isAdmin ? (
          <AdminPanel onBack={logout} />
        ) : (
          <>
            <EmployeeClockIn
              employees={employees}
              onClockAction={handleClockAction}
              loading={overallLoading}
            />
            <WeeklyDashboard employees={employees} logs={logs} />
          </>
        )}
      </div>
      
      <Dialog open={showManualClockIn} onOpenChange={setShowManualClockIn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entrada Manual Olvidada</DialogTitle>
             <DialogDescription>
                No se encontró una entrada abierta. Se ha pre-calculado una hora de entrada 8 horas antes de este momento. Ajústala si es necesario.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <DateTimePicker date={manualClockInTime} setDate={setManualClockInTime} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManualClockIn(false)}>Cancelar</Button>
            <Button onClick={handleManualClockInSubmit}>Registrar Entrada y Salida</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showClockInWarning} onOpenChange={setShowClockInWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Nueva Entrada</DialogTitle>
             <DialogDescription>
                Acabas de registrar una salida a las {lastClockOutTime}. ¿Estás seguro de que quieres iniciar un nuevo turno tan pronto?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClockInWarning(false)}>Cancelar</Button>
            <Button onClick={handleClockInWarningConfirm}>Sí, registrar entrada</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showTurnCompletedWarning} onOpenChange={setShowTurnCompletedWarning}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Turno ya completado</AlertDialogTitle>
                  <AlertDialogDescription>
                      Ya has registrado una salida para tu turno actual. No puedes registrar otra salida sin antes haber registrado una nueva entrada. Si crees que esto es un error, por favor, contacta al administrador.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogAction onClick={() => setShowTurnCompletedWarning(false)}>Entendido</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={showLongTurnWarning} onOpenChange={setShowLongTurnWarning}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Turno Excesivamente Largo</AlertDialogTitle>
                  <AlertDialogDescription>
                      El sistema ha detectado que tu turno abierto ha superado las {MAX_SHIFT_HOURS} horas. No se puede registrar la salida automáticamente. Por favor, contacta a un administrador para revisar y corregir tu registro.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogAction onClick={() => setShowLongTurnWarning(false)}>Entendido</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AppLayout;
