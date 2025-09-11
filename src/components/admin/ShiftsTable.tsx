import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useShifts } from '@/contexts/ShiftsContext';
import { Trash2, Edit, Plus, XCircle } from 'lucide-react';
import { type Employee, type TimeLog, type ProcessedShift } from '@/types';
import { differenceInHours, differenceInMinutes, format } from 'date-fns';
import { MAX_SHIFT_HOURS, MAX_SHIFT_MINUTES } from '@/config/rules';
import ManualExitDialog from './ManualExitDialog';
import AddShiftDialog from './AddShiftDialog';
import EditShiftDialog from './EditShiftDialog';

interface ShiftsTableProps {
  logs: TimeLog[];
  employees: Employee[];
  onUpdateShift: (entryRow: number, exitRow: number, entryTimestamp: string, exitTimestamp: string) => Promise<void>;
  onCorrectionComplete: () => void;
  filterByEmployeeId?: string | null; // Make prop optional
  onClearFilter?: () => void; // Make prop optional
}

const ShiftsTable: React.FC<ShiftsTableProps> = ({ logs, employees, onUpdateShift, onCorrectionComplete, filterByEmployeeId, onClearFilter }) => {
  const [isCorrectionDialogOpen, setIsCorrectionDialogOpen] = useState(false);
  const [isAddShiftDialogOpen, setIsAddShiftDialogOpen] = useState(false);
  const [isEditShiftDialogOpen, setIsEditShiftDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ProcessedShift | null>(null);

  const processedShifts = useMemo(() => {
    const employeeMap = new Map(employees.map(e => [e.id, e.full_name]));
    const openShifts = new Map<string, TimeLog>();
    const shifts: ProcessedShift[] = [];

    const sortedLogs = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    sortedLogs.forEach(log => {
      if (log.type === 'ENTRADA') {
        if (openShifts.has(log.employeeId)) {
          const openShift = openShifts.get(log.employeeId)!;
          shifts.push({
            id: openShift.shiftId!,
            employeeId: openShift.employeeId,
            employeeName: employeeMap.get(openShift.employeeId) || openShift.employeeId,
            entryTimestamp: openShift.timestamp,
            isAnomalous: true,
            entryRow: openShift.row,
          });
        }
        openShifts.set(log.employeeId, log);
      } else if (log.type === 'SALIDA') {
        if (openShifts.has(log.employeeId)) {
          const openShift = openShifts.get(log.employeeId)!;
          shifts.push({
            id: openShift.shiftId!, // <-- ID CORREGIDO
            employeeId: openShift.employeeId,
            employeeName: employeeMap.get(openShift.employeeId) || openShift.employeeId,
            entryTimestamp: openShift.timestamp,
            exitTimestamp: log.timestamp,
            duration: differenceInHours(new Date(log.timestamp), new Date(openShift.timestamp)),
            isAnomalous: differenceInMinutes(new Date(log.timestamp), new Date(openShift.timestamp)) > MAX_SHIFT_MINUTES,
            entryRow: openShift.row,
            exitRow: log.row,
          });
          openShifts.delete(log.employeeId);
        } else {
          // Orphan SALIDA
        }
      }
    });

    openShifts.forEach(openShift => {
      shifts.push({
        id: openShift.shiftId!,
        employeeId: openShift.employeeId,
        employeeName: employeeMap.get(openShift.employeeId) || openShift.employeeId,
        entryTimestamp: openShift.timestamp,
        isAnomalous: differenceInMinutes(new Date(), new Date(openShift.timestamp)) > MAX_SHIFT_MINUTES,
        entryRow: openShift.row,
      });
    });

    const allShifts = shifts.sort((a, b) => new Date(b.entryTimestamp).getTime() - new Date(a.entryTimestamp).getTime());

    // AÑADIR LÓGICA DE FILTRADO
    if (filterByEmployeeId) {
      return allShifts.filter(shift => shift.employeeId === filterByEmployeeId);
    }

    return allShifts;
  }, [logs, employees, filterByEmployeeId]);

  const handleOpenDialog = (dialog: 'correct' | 'edit', shift: ProcessedShift) => {
    setSelectedShift(shift);
    if (dialog === 'correct') setIsCorrectionDialogOpen(true);
    if (dialog === 'edit') setIsEditShiftDialogOpen(true);
  };

  const handleCloseDialogs = () => {
    setSelectedShift(null);
    setIsCorrectionDialogOpen(false);
    setIsEditShiftDialogOpen(false);
    setIsAddShiftDialogOpen(false);
  };

  const { deleteShift } = useShifts();

  const handleDeleteShift = async (shift: ProcessedShift) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta actividad? Esta acción es irreversible.')) return;
    try {
      await deleteShift(shift.id);
    } catch (error) {
      // Error is already handled and toasted in the context
      console.error("Failed to delete shift from component:", error);
    }
  }

  const employeeFilterName = filterByEmployeeId ? employees.find(e => e.id === filterByEmployeeId)?.full_name : '';

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        {filterByEmployeeId && onClearFilter ? (
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              Mostrando turnos de: <span className="font-semibold">{employeeFilterName}</span>
            </p>
            <Button variant="outline" size="sm" onClick={onClearFilter}>
              <XCircle className="mr-2 h-4 w-4" />
              Limpiar Filtro
            </Button>
          </div>
        ) : (
          <div></div> // Placeholder to keep "Agregar Turno" on the right
        )}
        <Button onClick={() => setIsAddShiftDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Añadir Actividad
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Miembro</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Salida</TableHead>
              <TableHead>Duración (Horas)</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedShifts.map((shift) => (
              <TableRow key={shift.id} className={shift.isAnomalous ? 'bg-red-100' : ''}>
                <TableCell>{shift.employeeName}</TableCell>
                <TableCell>{format(new Date(shift.entryTimestamp), 'dd/MM/yy HH:mm')}</TableCell>
                <TableCell>
                  {shift.exitTimestamp ? format(new Date(shift.exitTimestamp), 'dd/MM/yy HH:mm') : (
                    shift.isAnomalous ? <span className="text-red-600 font-bold">Necesita Corrección</span> : 'Actividad Abierta'
                  )}
                </TableCell>
                <TableCell>
                  {shift.duration !== undefined ? (
                    shift.duration
                  ) : (
                    shift.isAnomalous ? `> ${MAX_SHIFT_HOURS}h` : '-'
                  )}
                </TableCell>
                <TableCell className="flex gap-2">
                  {shift.isAnomalous ? (
                    <>
                      <Button size="sm" variant="destructive" onClick={() => handleOpenDialog('correct', shift)}>
                        Corregir Actividad
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteShift(shift)}>
                          <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : shift.exitTimestamp ? (
                    <>
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog('edit', shift)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteShift(shift)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteShift(shift)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {isCorrectionDialogOpen && selectedShift && (
        <ManualExitDialog
          isOpen={isCorrectionDialogOpen}
          onClose={handleCloseDialogs}
          shift={selectedShift}
          onCorrectionComplete={onCorrectionComplete}
        />
      )}
      {isAddShiftDialogOpen && (
          <AddShiftDialog 
            isOpen={isAddShiftDialogOpen} 
            onClose={handleCloseDialogs} 
            onShiftAdded={onCorrectionComplete} 
            employees={employees}
          />
      )}
      {isEditShiftDialogOpen && selectedShift && (
          <EditShiftDialog 
            isOpen={isEditShiftDialogOpen} 
            onClose={handleCloseDialogs} 
            shift={selectedShift}
          />
      )}
    </>
  );
};

export default ShiftsTable;
