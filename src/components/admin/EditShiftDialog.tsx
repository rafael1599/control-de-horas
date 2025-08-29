import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { type ProcessedShift } from '@/types';
import { LOG_SHEET_NAME } from '@/config/sheets';
import { validateEditShift } from '@/lib/validators'; // NEW IMPORT
// Removed: differenceInMinutes, MAX_SHIFT_HOURS, MAX_SHIFT_MINUTES, areAllFieldsFilled, isNotInFuture, isShiftDurationValid

interface EditShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shift: ProcessedShift;
}

const EditShiftDialog: React.FC<EditShiftDialogProps> = ({ isOpen, onClose, shift }) => {
  const [entryTime, setEntryTime] = useState<Date | undefined>();
  const [exitTime, setExitTime] = useState<Date | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    if (shift) {
      setEntryTime(new Date(shift.entryTimestamp));
      setExitTime(shift.exitTimestamp ? new Date(shift.exitTimestamp) : undefined);
    }
  }, [shift]);

  const handleSubmit = async () => {
    // Centralized Frontend Validations
    const validation = validateEditShift(entryTime, exitTime, shift);
    if (!validation.isValid) {
      toast({ title: "Error", description: validation.message, variant: "destructive" });
      return;
    }

    try {
      // Update entry timestamp
      await apiService.updateCell(LOG_SHEET_NAME, shift.entryRow, 1, entryTime!.toISOString());
      // Update exit timestamp
      await apiService.updateCell(LOG_SHEET_NAME, shift.exitRow!, 1, exitTime!.toISOString()); // Use shift.exitRow! as it's validated to exist

      toast({ title: "Éxito", description: "Turno actualizado correctamente." });
      onClose();
      // We need to trigger a reload of shifts in the parent component (ShiftsTable -> AdminPanel -> ShiftsContext)
      // This is handled by the onCorrectionComplete prop in ShiftsTable, which is passed from AdminPanel.
      // We need to call reloadShifts from ShiftsContext.
      // For now, we'll rely on the parent to reload.
    } catch (error) {
      console.error("Error updating shift:", error);
      toast({ title: "Error", description: "No se pudo actualizar el turno.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Turno</DialogTitle>
          <DialogDescription>
            Ajusta las horas de entrada y salida para el turno de <strong>{shift.employeeName}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Fecha y Hora de Entrada</label>
              <DateTimePicker date={entryTime} setDate={setEntryTime} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Fecha y Hora de Salida</label>
              <DateTimePicker date={exitTime} setDate={setExitTime} minDate={entryTime} />
            </div>
          </>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditShiftDialog;
