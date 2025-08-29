import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import EmployeeClockIn from './EmployeeClockIn';
import WeeklyDashboard from './WeeklyDashboard';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';
import { type Employee, type TimeLog } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees } from '@/contexts/EmployeesContext';
import { useShifts } from '@/contexts/ShiftsContext';
import { MAX_SHIFT_HOURS } from '@/lib/validators'; // MAX_SHIFT_HOURS is still needed for the dialog message
import { TOAST_MESSAGES, DIALOG_MESSAGES, BUTTON_LABELS, LOADING_MESSAGES } from '@/lib/messages';
import { useClockingActions } from '@/hooks/useClockingActions';
import { useManualClockIn } from '@/hooks/useManualClockIn';

const AppLayout: React.FC = () => {
  const { isAdmin, logout } = useAuth();
  const { employees, loading: loadingEmployees } = useEmployees();
  const { shifts: logsFromContext, loading: loadingShifts } = useShifts();
  
  const {
    displayLogs, // Added this
    handleClockAction,
    handleCancelClockIn,
    handleClockInWarningConfirm,
    showClockInWarning,
    setShowClockInWarning,
    pendingClockInData,
    lastClockOutTime,
    showTurnCompletedWarning,
    setShowTurnCompletedWarning,
    showLongTurnWarning,
    setShowLongTurnWarning,
  } = useClockingActions({ initialLogs: logsFromContext, employees }); // Pass logsFromContext as initialLogs

  const {
    showManualClockIn,
    setShowManualClockIn,
    employeeForManualClockIn,
    setEmployeeForManualClockIn,
    manualClockInTime,
    setManualClockInTime,
    handleManualClockInSubmit,
  } = useManualClockIn({ employees });

  // Removed useEffect and displayLogs state

  const overallLoading = loadingEmployees || loadingShifts;

  if (overallLoading && employees.length === 0 && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">{LOADING_MESSAGES.LOADING}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <WeeklyDashboard 
              employees={employees} 
              logs={logsFromContext} 
              onCancelClockIn={handleCancelClockIn}
            />
          </>
        )}
      </div>
      <Dialog open={showManualClockIn} onOpenChange={setShowManualClockIn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{DIALOG_MESSAGES.MANUAL_CLOCK_IN_TITLE}</DialogTitle>
             <DialogDescription>
                {DIALOG_MESSAGES.MANUAL_CLOCK_IN_DESCRIPTION}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <DateTimePicker date={manualClockInTime} setDate={setManualClockInTime} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManualClockIn(false)}>{BUTTON_LABELS.CANCEL}</Button>
            <Button onClick={handleManualClockInSubmit}>Registrar Entrada y Salida</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showClockInWarning} onOpenChange={setShowClockInWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{DIALOG_MESSAGES.CONFIRM_NEW_ENTRY_TITLE}</DialogTitle>
             <DialogDescription>
                {DIALOG_MESSAGES.CONFIRM_NEW_ENTRY_DESCRIPTION(lastClockOutTime)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClockInWarning(false)}>{BUTTON_LABELS.CANCEL}</Button>
            <Button onClick={handleClockInWarningConfirm}>Sí, registrar entrada</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={showTurnCompletedWarning} onOpenChange={setShowTurnCompletedWarning}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>{DIALOG_MESSAGES.TURN_COMPLETED_TITLE}</AlertDialogTitle>
                  <AlertDialogDescription>
                      {DIALOG_MESSAGES.TURN_COMPLETED_DESCRIPTION}
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogAction onClick={() => setShowTurnCompletedWarning(false)}>{BUTTON_LABELS.UNDERSTOOD}</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showLongTurnWarning} onOpenChange={setShowLongTurnWarning}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>{DIALOG_MESSAGES.LONG_TURN_TITLE}</AlertDialogTitle>
                  <AlertDialogDescription>
                      {DIALOG_MESSAGES.LONG_TURN_DESCRIPTION(MAX_SHIFT_HOURS)}
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogAction onClick={() => setShowLongTurnWarning(false)}>{BUTTON_LABELS.UNDERSTOOD}</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AppLayout;
