import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { useShifts } from '@/contexts/ShiftsContext';
import { useToast } from '@/hooks/use-toast';
import { addHours, isAfter, isBefore } from 'date-fns';
import { MAX_SHIFT_HOURS } from '@/config/rules';
// import { apiService } from '@/services/api';
import { type ProcessedShift } from '@/types';

// Assuming ProcessedShift is defined in ShiftsTable and imported here
// For now, let's define a minimal version of it.


interface ManualExitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shift: ProcessedShift;
  // This should be a function that reloads all the data.
  onCorrectionComplete: () => void; 
}

const ManualExitDialog: React.FC<ManualExitDialogProps> = ({ isOpen, onClose, shift, onCorrectionComplete }) => {
  const [exitTime, setExitTime] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const entryDate = useMemo(() => new Date(shift.entryTimestamp), [shift.entryTimestamp]);

  const { minDate, maxDate } = useMemo(() => {
    const min = entryDate;
    const maxAllowed = addHours(entryDate, 18); // Using 18 hours as per our last change
    const now = new Date();
    const max = isAfter(maxAllowed, now) ? now : maxAllowed;
    return { minDate: min, maxDate: max };
  }, [entryDate]);

  useEffect(() => {
    // When the dialog opens, set the initial time. 
    // This should only run when the dialog is opened or the shift changes.
    if (isOpen) {
      setExitTime(maxDate);
    }
  }, [isOpen, maxDate, shift]);

  const { updateShift } = useShifts();

  const handleSubmit = async () => {
    if (!exitTime) {
      toast({ title: 'Error', description: 'Por favor, selecciona una hora de salida.' });
      return;
    }

    setLoading(true);
    try {
      await updateShift(shift.id, { end_time: exitTime });
      toast({ title: 'Éxito', description: 'El turno ha sido corregido exitosamente.' });
      onCorrectionComplete();
      onClose();
    } catch (error) {
      // The error is already toasted by the context
      console.error("Failed to correct shift:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Corregir Turno Anómalo</DialogTitle>
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
            La salida debe ser posterior al inicio del turno, no puede exceder las {MAX_SHIFT_HOURS} horas de duración y no puede ser en el futuro.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Corrección'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManualExitDialog;