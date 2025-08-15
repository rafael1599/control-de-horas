import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { isAfter } from 'date-fns';
import { apiService } from '@/services/api';
import { type Employee } from '@/types';

interface AddShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onShiftAdded: () => void;
  employees: Employee[];
}

const AddShiftDialog: React.FC<AddShiftDialogProps> = ({ isOpen, onClose, onShiftAdded, employees }) => {
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const [entryTime, setEntryTime] = useState<Date | undefined>(new Date());
  const [exitTime, setExitTime] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!employeeId || !entryTime || !exitTime) {
      toast({ title: "Error", description: "Por favor, completa todos los campos.", variant: "destructive" });
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

    setLoading(true);
    try {
      // Add entry log
      await apiService.addLog(employeeId, 'ENTRADA', entryTime.toISOString(), 'Manual');
      // Add exit log
      await apiService.addLog(employeeId, 'SALIDA', exitTime.toISOString(), 'Manual');

      toast({ title: "Éxito", description: "El nuevo turno ha sido agregado correctamente." });
      onShiftAdded();
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo agregar el turno.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Turno Manualmente</DialogTitle>
          <DialogDescription>
            Completa los detalles para registrar un turno pasado.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex flex-col gap-2">
            <label className="font-medium">Empleado</label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecciona un empleado" />
                </SelectTrigger>
                <SelectContent>
                    {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium">Fecha y Hora de Entrada</label>
            <DateTimePicker date={entryTime} setDate={setEntryTime} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium">Fecha y Hora de Salida</label>
            <DateTimePicker date={exitTime} setDate={setExitTime} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Turno'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddShiftDialog;