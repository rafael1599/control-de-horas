import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { useToast } from '@/hooks/use-toast';
import { addHours } from 'date-fns'; // Keep addHours
import { apiService } from '@/services/api';
import { type ProcessedShift } from '@/types';
import { MAX_SHIFT_HOURS } from '@/lib/validators'; // Keep MAX_SHIFT_HOURS
import { validateManualExit } from '@/lib/validators'; // NEW IMPORT
import { LOG_SHEET_NAME } from '@/config/sheets'; // NEW IMPORT
import { TOAST_MESSAGES, DIALOG_MESSAGES, BUTTON_LABELS, VALIDATION_MESSAGES } from '@/lib/messages';
// Removed: isAfter, isBefore, areAllFieldsFilled, isNotInFuture

interface ManualExitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shift: ProcessedShift;
  onCorrectionComplete: () => void; 
}

const ManualExitDialog: React.FC<ManualExitDialogProps> = ({ isOpen, onClose, shift, onCorrectionComplete }) => {
  const [exitTime, setExitTime] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  const entryDate = useMemo(() => new Date(shift.entryTimestamp), [shift.entryTimestamp]);

  const { minDate, maxDate } = useMemo(() => {
    const min = entryDate;
    const maxAllowed = addHours(entryDate, MAX_SHIFT_HOURS);
    const now = new Date();
    const max = now < maxAllowed ? now : maxAllowed; // Ensure max is not in future and not beyond allowed duration
    return { minDate: min, maxDate: max };
  }, [entryDate]);

  useEffect(() => {
    if (isOpen) {
      setExitTime(maxDate);
    }
  }, [isOpen, maxDate, shift]);

  const handleSubmit = async () => {
    // Centralized Frontend Validations
    const validation = validateManualExit(exitTime, minDate, maxDate);
    if (!validation.isValid) {
      toast({ title: TOAST_MESSAGES.ERROR_TITLE, description: validation.message, variant: "destructive" });
      return;
    }

    try {
      const selectedEmployee = shift.employeeName;
      const exitRowData = [
        exitTime!.toISOString(),
        `'${shift.employeeId}`,
        selectedEmployee,
        'SALIDA',
        'Manual'
      ];

      await apiService.addRow(LOG_SHEET_NAME, exitRowData);
      toast({ title: TOAST_MESSAGES.SUCCESS_TITLE, description: `Salida corregida para ${shift.employeeName}` });
      onCorrectionComplete();
      onClose();
    } catch (error) {
      console.error("Error adding manual exit:", error);
      toast({ title: TOAST_MESSAGES.ERROR_TITLE, description: "No se pudo guardar la corrección.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{"Corregir Turno Anómalo"}</DialogTitle>
          <DialogDescription>
            Estás corrigiendo la hora de salida para <strong>{shift.employeeName}</strong>.<br />
            Turno iniciado: {entryDate.toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="flex flex-col gap-2">
                 <span className="font-medium">Fecha y Hora de Salida:</span>
                 <DateTimePicker 
                    date={exitTime} 
                    setDate={setExitTime} 
                    minDate={minDate}
                    maxDate={maxDate} 
                />
            </div>
           <p className="text-sm text-muted-foreground">
            {VALIDATION_MESSAGES.EXIT_TIME_OUT_OF_RANGE(MAX_SHIFT_HOURS)}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{BUTTON_LABELS.CANCEL}</Button>
          <Button onClick={handleSubmit}>
            Guardar Corrección
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManualExitDialog;