import React, { useState } from 'react';
import { toast } from 'sonner'; // Usamos sonner para los toasts
import { EmployeeClockIn } from './EmployeeClockIn';
import WeeklyDashboard from './WeeklyDashboard';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';
import { clockInOut } from '@/services/api';
import { type Employee, type TimeLog, type ProcessedShift } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees } from '@/contexts/EmployeesContext';
import { useShifts } from '@/contexts/ShiftsContext';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
} from '@/components/ui/alert-dialog';
import ManualExitDialog from './admin/ManualExitDialog';
import { addHours, differenceInMinutes, isAfter, isBefore } from 'date-fns';
import { MAX_SHIFT_HOURS, MAX_SHIFT_MINUTES, MIN_TIME_BETWEEN_SHIFTS_MINUTES } from '@/config/rules';

const AppLayout: React.FC = () => {
  const { isAdmin, logout } = useAuth();
  const { employees, loading: loadingEmployees, reloadEmployees } = useEmployees();
  const { shifts: logs, openShifts, processedShifts, loading: loadingShifts, reloadShifts, updateShift } = useShifts();
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [warningDetails, setWarningDetails] = useState<{ 
    employeeId: string; 
    action: 'in' | 'out' | 're-entry'; 
    message: string; 
    title: string; 
  } | null>(null);

  const [showManualExitDialog, setShowManualExitDialog] = useState(false);
  const [anomalousShift, setAnomalousShift] = useState<ProcessedShift | null>(null);

  const overallLoading = loadingEmployees || loadingShifts || isActionLoading;

  const handleClockAction = async (employeeId: string, currentStatus: 'in' | 'out') => {
    console.log("handleClockAction: Iniciando acción para", employeeId, "estado", currentStatus);
    setIsActionLoading(true);
    try {
      const companyId = employees[0]?.companyId;
      if (!companyId) {
        toast.error("No se pudo determinar la compañía.");
        return;
      }

      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) {
        toast.error("Miembro no encontrado.");
        return;
      }

      console.log("handleClockAction: openShifts antes de la acción:", openShifts);

      if (currentStatus === 'in') { // User wants to clock IN (this is the 'Entrar' button)
        console.log("handleClockAction: Intentando fichar ENTRADA.");
        const isOpenShift = openShifts.some(shift => shift.employeeId === employeeId);
        if (isOpenShift) {
          toast.error("El miembro ya tiene una actividad abierta. No se puede registrar una nueva entrada.");
          return; // No permitir doble entrada
        }

        const filteredProcessedShifts = processedShifts
          .filter(shift => shift.employeeId === employeeId && shift.exitTimestamp); // Use shift.exitTimestamp directly

        const lastClosedShift = filteredProcessedShifts
          .sort((a, b) => new Date(b.exitTimestamp!).getTime() - new Date(a.exitTimestamp!).getTime())[0];

        if (lastClosedShift) {
          const timeSinceLastExit = differenceInMinutes(new Date(), new Date(lastClosedShift.exitTimestamp!));
          if (timeSinceLastExit < MIN_TIME_BETWEEN_SHIFTS_MINUTES) {
            setWarningDetails({
              employeeId,
              action: 're-entry',
              message: `El miembro ${employee.full_name} acaba de fichar salida hace menos de ${MIN_TIME_BETWEEN_SHIFTS_MINUTES} minutos. ¿Está seguro de que quiere iniciar una nueva actividad tan pronto?`,
              title: 'Entrada Rápida Detectada',
            });
            setShowWarningDialog(true);
            return;
          }
        }
      } else if (currentStatus === 'out') { // User wants to clock OUT (this is the 'Salir' button)
        console.log("handleClockAction: Intentando fichar SALIDA.");
        const shiftToClose = openShifts.find(shift => shift.employeeId === employeeId);

        if (!shiftToClose) {
          // If trying to clock out without an open shift, offer manual correction
          setAnomalousShift({
            id: `manual-${employeeId}-${new Date().toISOString()}`,
            employeeId: employeeId,
            employeeName: employee.full_name,
            entryTimestamp: new Date().toISOString(), // Simulate an entry now
            isAnomalous: true, // It's anomalous because there was no real entry
            entryRow: 0, // No real row
          });
          setShowManualExitDialog(true);
          return;
        }

        // Validar duración del turno antes de la salida
        const entryDate = new Date(shiftToClose.entryTimestamp);
        const now = new Date();
        const durationMinutes = differenceInMinutes(now, entryDate);

        if (durationMinutes > MAX_SHIFT_MINUTES) {
          // Turno demasiado largo, mostrar advertencia no bloqueante
          toast.warning(`La actividad ha superado las ${MAX_SHIFT_HOURS} horas. Se ha registrado la salida, pero esta actividad será marcada para revisión.`);
        }

        // Si la salida es muy rápida después de la entrada
        if (durationMinutes < 1) { // Menos de 1 minuto
          setWarningDetails({
            employeeId,
            action: 'in', // Action to perform if confirmed: clock out
            message: `El miembro ${employee.full_name} acaba de fichar entrada. ¿Está seguro de que quiere fichar salida tan pronto?`,
            title: 'Salida Rápida Detectada',
          });
          setShowWarningDialog(true);
          return;
        }
      }

      // If no specific frontend validation triggered, proceed with backend clockInOut
      const result = await clockInOut(employeeId, companyId);
      toast.success(result.message);

    } catch (error) {
      const err = error as Error;
      console.error("Clock action failed:", error);
      toast.error(err.message || "No se pudo registrar la acción.");
    } finally {
      setIsActionLoading(false);
      reloadEmployees();
      reloadShifts();
    }
  };

  const handleWarningConfirm = async () => {
    if (warningDetails) {
      setIsActionLoading(true);
      try {
        const companyId = employees[0]?.companyId;
        if (!companyId) {
          toast.error("No se pudo determinar la compañía.");
          return;
        }
        await clockInOut(warningDetails.employeeId, companyId);
        toast.success(`Acción de ${employees.find(emp => emp.id === warningDetails.employeeId)?.full_name} registrada.`);
      } catch (error) {
        const err = error as Error;
        toast.error(err.message || "No se pudo registrar la acción.");
      } finally {
        setIsActionLoading(false);
        setShowWarningDialog(false);
        setWarningDetails(null);
        reloadEmployees();
        reloadShifts();
      }
    }
  };

  const handleManualExitComplete = () => {
    setShowManualExitDialog(false);
    setAnomalousShift(null);
    reloadEmployees();
    reloadShifts();
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

      <div className="container mx-auto px-2 py-4 sm:px-4 space-y-6">
        {isAdmin ? (
          <AdminPanel onBack={logout} />
        ) : (
          <>
            <EmployeeClockIn
              employees={employees}
              onClockAction={handleClockAction}
            />
          </>
        )}
      </div>

      {/* Diálogo de Advertencia */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{warningDetails?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {warningDetails?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowWarningDialog(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleWarningConfirm}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de Corrección Manual */}
      {showManualExitDialog && anomalousShift && (
        <ManualExitDialog
          isOpen={showManualExitDialog}
          onClose={() => setShowManualExitDialog(false)}
          shift={anomalousShift}
          onCorrectionComplete={handleManualExitComplete}
        />
      )}
    </div>
  );
};

export default AppLayout;
