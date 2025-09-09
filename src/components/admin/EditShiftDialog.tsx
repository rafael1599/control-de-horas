import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { toast } from 'sonner';
import { isAfter, differenceInMinutes } from 'date-fns';
import { type ProcessedShift } from '@/types';
import { MAX_SHIFT_HOURS, MAX_SHIFT_MINUTES } from '@/config/rules';
import { Loader2 } from 'lucide-react';
import { useShifts } from '@/contexts/ShiftsContext'; // <-- 1. IMPORTAR

interface EditShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shift: ProcessedShift;
  // onUpdate prop is no longer needed
}

const EditShiftDialog: React.FC<EditShiftDialogProps> = ({ isOpen, onClose, shift }) => {
  const [start_time, setStartTime] = useState<Date | undefined>();
  const [end_time, setEndTime] = useState<Date | undefined>();
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateShift } = useShifts(); // <-- 2. OBTENER FUNCIÓN

  useEffect(() => {
    if (shift) {
      setStartTime(new Date(shift.entryTimestamp));
      setEndTime(shift.exitTimestamp ? new Date(shift.exitTimestamp) : undefined);
    }
  }, [shift]);

  const handleSubmit = async () => {
    if (!start_time || !end_time) {
      toast.error("Datos del turno inválidos.");
      return;
    }

    if (isAfter(start_time, end_time)) {
      toast.error("La hora de salida debe ser posterior a la hora de entrada.");
      return;
    }

    if (differenceInMinutes(end_time, start_time) > MAX_SHIFT_MINUTES) {
      toast.error(`La duración del turno no puede exceder las ${MAX_SHIFT_HOURS} horas.`);
      return;
    }

    setIsUpdating(true);
    try {
      // 3. LLAMAR A LA NUEVA FUNCIÓN
      await updateShift(shift.id, { start_time, end_time });
      toast.success("Turno actualizado correctamente");
      onClose();
    } catch (error) {
      // El error ya se maneja en el contexto
      console.error("Failed to update shift:", error);
    } finally {
      setIsUpdating(false);
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
          {isUpdating ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="ml-4 text-muted-foreground">Actualizando turno...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <label className="font-medium">Fecha y Hora de Entrada</label>
                <DateTimePicker date={start_time} setDate={setStartTime} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-medium">Fecha y Hora de Salida</label>
                <DateTimePicker date={end_time} setDate={setEndTime} minDate={start_time} />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
            {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditShiftDialog;