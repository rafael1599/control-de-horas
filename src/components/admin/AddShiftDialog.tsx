import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { type Employee } from '@/types';
import { validateAddShift } from '@/lib/validators'; // NEW IMPORT
import { LOG_SHEET_NAME } from '@/config/sheets'; // NEW IMPORT
// Removed: differenceInMinutes, MAX_SHIFT_HOURS, MAX_SHIFT_MINUTES, areAllFieldsFilled, isNotInFuture, isShiftDurationValid

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
    // Centralized Frontend Validations
    const validation = validateAddShift(employeeId, entryTime, exitTime);
    if (!validation.isValid) {
      toast({ title: "Error", description: validation.message, variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const selectedEmployee = employees.find(emp => emp.id === employeeId);
      if (!selectedEmployee) {
        toast({ title: "Error", description: "Empleado no encontrado.", variant: "destructive" });
        return;
      }

      // Construct rowData for ENTRADA
      const entryRowData = [
        entryTime!.toISOString(),
        `'${employeeId}`,
        selectedEmployee.name,
        'ENTRADA',
        'Manual'
      ];

      // Construct rowData for SALIDA
      const exitRowData = [
        exitTime!.toISOString(),
        `'${employeeId}`,
        selectedEmployee.name,
        'SALIDA',
        'Manual'
      ];

      // Add entry log
      await apiService.addRow(LOG_SHEET_NAME, entryRowData);
      // Add exit log
      await apiService.addRow(LOG_SHEET_NAME, exitRowData);

      toast({ title: "Éxito", description: "El nuevo turno ha sido agregado correctamente." });
      onShiftAdded(); // This will trigger reloadShifts in AdminPanel
      onClose();
    } catch (error) {
      console.error("Error adding shift:", error);
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
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Turno'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddShiftDialog;