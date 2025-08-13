import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus } from 'lucide-react';
import { Employee, TimeLog, apiService } from '@/services/api';
import { differenceInHours, format } from 'date-fns';
import ManualExitDialog from './ManualExitDialog';
import AddShiftDialog from './AddShiftDialog';
import EditShiftDialog from './EditShiftDialog';

interface ShiftsTableProps {
  logs: TimeLog[];
  employees: Employee[];
  onUpdateShift: (entryRow: number, exitRow: number, entryTimestamp: string, exitTimestamp: string) => Promise<void>;
  onCorrectionComplete: () => void; // To reload data
}

export interface ProcessedShift {
  id: string;
  employeeId: string;
  employeeName: string;
  entryTimestamp: string;
  exitTimestamp?: string;
  duration?: number;
  isAnomalous: boolean;
  entryRow: number;
  exitRow?: number;
}

const ShiftsTable: React.FC<ShiftsTableProps> = ({ logs, employees, onUpdateShift, onCorrectionComplete }) => {
  const [isCorrectionDialogOpen, setIsCorrectionDialogOpen] = useState(false);
  const [isAddShiftDialogOpen, setIsAddShiftDialogOpen] = useState(false);
  const [isEditShiftDialogOpen, setIsEditShiftDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ProcessedShift | null>(null);

  const processedShifts = useMemo(() => {
    const employeeMap = new Map(employees.map(e => [e.id, e.name]));
    const openShifts = new Map<string, TimeLog>();
    const shifts: ProcessedShift[] = [];

    const sortedLogs = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    sortedLogs.forEach(log => {
      if (log.type === 'ENTRADA') {
        if (openShifts.has(log.employeeId)) {
          const openShift = openShifts.get(log.employeeId)!;
          shifts.push({
            id: `${openShift.employeeId}-${openShift.timestamp}`,
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
          const duration = differenceInHours(new Date(log.timestamp), new Date(openShift.timestamp));
          shifts.push({
            id: `${openShift.employeeId}-${openShift.timestamp}`,
            employeeId: openShift.employeeId,
            employeeName: employeeMap.get(openShift.employeeId) || openShift.employeeId,
            entryTimestamp: openShift.timestamp,
            exitTimestamp: log.timestamp,
            duration,
            isAnomalous: duration > 23,
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
      const duration = differenceInHours(new Date(), new Date(openShift.timestamp));
      shifts.push({
        id: `${openShift.employeeId}-${openShift.timestamp}`,
        employeeId: openShift.employeeId,
        employeeName: employeeMap.get(openShift.employeeId) || openShift.employeeId,
        entryTimestamp: openShift.timestamp,
        isAnomalous: duration > 23,
        entryRow: openShift.row,
      });
    });

    return shifts.sort((a, b) => new Date(b.entryTimestamp).getTime() - new Date(a.entryTimestamp).getTime());

  }, [logs, employees]);

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

  const handleDeleteShift = async (shift: ProcessedShift) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este turno? Esta acción es irreversible.')) return;

    try {
        if (shift.exitRow && shift.entryRow) {
            await apiService.deleteShift(shift.entryRow, shift.exitRow);
        } else {
            await apiService.deleteLog(shift.entryRow);
        }
        onCorrectionComplete(); // Reload data
    } catch (error) {
        console.error("Failed to delete shift", error);
        // Here you might want to show a toast to the user
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
          <Button onClick={() => setIsAddShiftDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Turno
          </Button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
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
                    shift.isAnomalous ? <span className="text-red-600 font-bold">Necesita Corrección</span> : 'Turno Abierto'
                  )}
                </TableCell>
                <TableCell>
                  {shift.duration !== undefined ? (
                    shift.duration
                  ) : (
                    shift.isAnomalous ? "> 23h" : '-'
                  )}
                </TableCell>
                <TableCell className="flex gap-2">
                  {shift.isAnomalous && !shift.exitTimestamp ? (
                    <Button size="sm" variant="destructive" onClick={() => handleOpenDialog('correct', shift)}>
                      Corregir Turno
                    </Button>
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
            onUpdate={onUpdateShift}
            shift={selectedShift}
          />
      )}
    </>
  );
};

export default ShiftsTable;
