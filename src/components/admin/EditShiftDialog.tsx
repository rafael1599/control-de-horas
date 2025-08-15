import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { useToast } from '@/hooks/use-toast';
import { isAfter } from 'date-fns';
import { type ProcessedShift } from '@/types';
import { Loader2 } from 'lucide-react';

interface EditShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (entryRow: number, exitRow: number, entryTimestamp: string, exitTimestamp: string) => Promise<void>;
  shift: ProcessedShift;
}

const EditShiftDialog: React.FC<EditShiftDialogProps> = ({ isOpen, onClose, onUpdate, shift }) => {
  const [entryTime, setEntryTime] = useState<Date | undefined>();
  const [exitTime, setExitTime] = useState<Date | undefined>();
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (shift) {
      setEntryTime(new Date(shift.entryTimestamp));
      setExitTime(shift.exitTimestamp ? new Date(shift.exitTimestamp) : undefined);
    }
  }, [shift]);

  const handleSubmit = async () => {
    if (!entryTime || !exitTime || !shift.exitRow) {
      toast({ title: "Error", description: "Datos del turno inválidos.", variant: "destructive" });
      return;
    }

    if (isAfter(entryTime, new Date()) || isAfter(exitTime, new Date())) {
      toast({ title: "Error de Validación", description: "No se pueden registrar horas en el futuro.", variant: "destructive" });
      return;
    }

    if (!isAfter(exitTime, entryTime)) {
      toast({ title: "Error de Validación", description: "La hora de salida debe ser posterior a la hora de entrada.", variant: "destructive" });
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(
        shift.entryRow,
        shift.exitRow,
        entryTime.toISOString(),
        exitTime.toISOString()
      );
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar el turno.", variant: "destructive" });
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
                <DateTimePicker date={entryTime} setDate={setEntryTime} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-medium">Fecha y Hora de Salida</label>
                <DateTimePicker date={exitTime} setDate={setExitTime} />
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
