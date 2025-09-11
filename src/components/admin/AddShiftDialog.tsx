import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShifts } from '@/contexts/ShiftsContext'; // <-- 1. IMPORTAR useShifts
import { toast } from 'sonner';
import { isAfter } from 'date-fns';
import { type Employee } from '@/types';

interface AddShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
}

const AddShiftDialog: React.FC<AddShiftDialogProps> = ({ isOpen, onClose, employees }) => {
  const [employeeId, setEmployeeId] = useState<string>('');
  const [start_time, setStartTime] = useState<Date | undefined>(new Date());
  const [end_time, setEndTime] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);
  const { addShift } = useShifts(); // <-- 2. OBTENER LA FUNCIÓN addShift

  const handleSubmit = async () => {
    if (!employeeId || !start_time || !end_time) {
      toast.error('Por favor, completa todos los campos.');
      return;
    }

    if (isAfter(start_time, end_time)) {
      toast.error('La fecha de entrada no puede ser posterior a la de salida.');
      return;
    }

    setLoading(true);
    try {
      // 3. LLAMAR A LA FUNCIÓN DEL CONTEXTO
      await addShift({ employeeId, start_time, end_time });
      onClose(); // Cierra el diálogo solo si tiene éxito
    } catch (error) {
      // El error ya se muestra a través del toast en el contexto
      console.error("Failed to add manual shift:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Añadir Actividad Manualmente</DialogTitle>
          <DialogDescription>
            Completa los detalles para registrar una actividad pasada.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex flex-col gap-2">
            <label className="font-medium">Miembro</label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecciona un miembro" />
                </SelectTrigger>
                <SelectContent>
                    {employees.map(emp => (
                        // 4. BUG CORREGIDO: emp.name -> emp.full_name
                        <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium">Fecha y Hora de Entrada</label>
            <DateTimePicker date={start_time} setDate={setStartTime} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium">Fecha y Hora de Salida</label>
            <DateTimePicker date={end_time} setDate={setEndTime} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Actividad'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddShiftDialog;
