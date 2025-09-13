import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useShifts } from '@/contexts/ShiftsContext';
import { Trash2, Edit, Plus, XCircle } from 'lucide-react';
import { type Employee, type TimeLog, type ProcessedShift } from '@/types';
import { differenceInMilliseconds, differenceInMinutes, format } from 'date-fns';
import { MAX_SHIFT_HOURS, MAX_SHIFT_MINUTES } from '@/config/rules';
import ManualExitDialog from './ManualExitDialog';
import AddShiftDialog from './AddShiftDialog';
import EditShiftDialog from './EditShiftDialog';


interface ShiftsTableProps {
  shifts: ProcessedShift[];
  employees: Employee[];
  onUpdateShift: (entryRow: number, exitRow: number, entryTimestamp: string, exitTimestamp: string) => Promise<void>;
  onCorrectionComplete: () => void;
  filterByEmployeeId?: string | null;
  onClearFilter?: () => void;
}

const ShiftsTable: React.FC<ShiftsTableProps> = ({ shifts, employees, onUpdateShift, onCorrectionComplete, filterByEmployeeId, onClearFilter }) => {
  const [isCorrectionDialogOpen, setIsCorrectionDialogOpen] = useState(false);
  const [isAddShiftDialogOpen, setIsAddShiftDialogOpen] = useState(false);
  const [isEditShiftDialogOpen, setIsEditShiftDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ProcessedShift | null>(null);

  const filteredShifts = useMemo(() => {
    if (filterByEmployeeId) {
      return shifts.filter(shift => shift.employeeId === filterByEmployeeId);
    }
    return shifts;
  }, [shifts, filterByEmployeeId]);

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
          <div></div>
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
              <TableHead className="hidden md:table-cell">Entrada</TableHead>
              <TableHead className="hidden md:table-cell">Salida</TableHead>
              <TableHead className="md:hidden">Periodo</TableHead>
              <TableHead>Duración (Horas)</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShifts.map((shift) => (
              <TableRow key={shift.id} className={shift.isAnomalous ? 'bg-red-100' : ''}>
                <TableCell>{shift.employeeName}</TableCell>
                
                {/* Desktop cells */}
                <TableCell className="hidden md:table-cell">{format(new Date(shift.entryTimestamp), 'dd/MM/yy HH:mm')}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {shift.exitTimestamp ? format(new Date(shift.exitTimestamp), 'dd/MM/yy HH:mm') : (
                    shift.isAnomalous ? <span className="text-red-600 font-bold">Necesita Corrección</span> : 'Actividad Abierta'
                  )}
                </TableCell>

                {/* Mobile cell */}
                <TableCell className="md:hidden">
                  <div className="flex flex-col text-xs">
                    <span><span className="font-semibold">In:</span> {format(new Date(shift.entryTimestamp), 'dd/MM HH:mm')}</span>
                    <span><span className="font-semibold">Out:</span> {shift.exitTimestamp ? format(new Date(shift.exitTimestamp), 'dd/MM HH:mm') : (shift.isAnomalous ? <span className="text-red-500">Error</span> : 'Abierto')}</span>
                  </div>
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