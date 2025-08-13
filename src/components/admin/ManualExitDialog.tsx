import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { useToast } from '@/hooks/use-toast';
import { addHours, isAfter, isBefore } from 'date-fns';
import { apiService } from '@/services/api';

// Assuming ProcessedShift is defined in ShiftsTable and imported here
// For now, let's define a minimal version of it.
interface ProcessedShift {
  id: string;
  employeeId: string;
  employeeName: string;
  entryTimestamp: string;
  entryRow: number;
}

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
    const maxAllowed = addHours(entryDate, 23);
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

  const handleSubmit = async () => {
    if (!exitTime) {
      toast({
        title: "Error",
        description: "Por favor, selecciona una fecha y hora de salida.",
        variant: "destructive",
      });
      return;
    }

    // Final validation check before submitting
    if (isAfter(exitTime, maxDate) || isBefore(exitTime, minDate)) {
        toast({
            title: "Error de Validación",
            description: `La hora de salida debe estar entre el inicio del turno y el límite de corrección.`,
            variant: "destructive",
        });
        return;
    }

    setLoading(true);
    try {
      await apiService.addLog(shift.employeeId, 'SALIDA', exitTime.toISOString(), 'Manual');
      toast({
        title: "Éxito",
        description: `Salida corregida para ${shift.employeeName}`,
      });
      onCorrectionComplete(); // Reload data in the main view
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la corrección.",
        variant: "destructive",
      });
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
            La salida debe ser posterior al inicio del turno, no puede exceder las 23 horas de duración y no puede ser en el futuro.
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