import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { useWeeklyDashboard } from '@/hooks/useWeeklyDashboard';
import { type Employee, type TimeLog, type ProcessedShift } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EditShiftDialog from './EditShiftDialog';
import ManualExitDialog from './ManualExitDialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useShifts } from '@/contexts/ShiftsContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WeeklySummaryProps {
  employees: Employee[];
  shifts: ProcessedShift[];
}

const WeeklySummary: React.FC<WeeklySummaryProps> = ({ employees, shifts }) => {
  const { deleteShift } = useShifts();
  const {
    weeklyData,
    weekDisplay,
    weekOffset,
    goToPreviousWeek,
    goToNextWeek,
  } = useWeeklyDashboard(employees, shifts);

  const [editingShift, setEditingShift] = useState<ProcessedShift | null>(null);
  const [correctingShift, setCorrectingShift] = useState<ProcessedShift | null>(null);
  const [deletingShift, setDeletingShift] = useState<ProcessedShift | null>(null);

  const handleDeleteConfirm = async () => {
    if (deletingShift) {
      await deleteShift(deletingShift.id);
      setDeletingShift(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Resumen Semanal</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-slate-600 text-center w-32">{weekDisplay}</span>
            <Button variant="outline" size="icon" onClick={goToNextWeek} disabled={weekOffset === 0}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {weeklyData.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay registros cerrados para esta semana.</p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              <div className="grid grid-cols-3 gap-4 font-semibold text-sm text-gray-600 px-4 py-2 border-b">
                <div className="text-left">Miembro</div>
                <div className="text-right">Horas Totales</div>
                <div className="text-right">Pago Estimado</div>
              </div>
              {weeklyData.map((summary) => (
                <AccordionItem value={summary.employee.id} key={summary.employee.id} className="border-b">
                  <AccordionTrigger
                    className={cn(
                      "hover:no-underline rounded-lg p-4 text-sm",
                      "data-[state=open]:bg-blue-50 data-[state=open]:rounded-b-none",
                      summary.hasAnomalousShift && "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
                      "data-[state=open]:has-[.bg-yellow-50]:bg-yellow-100"
                    )}
                  >
                    <div className="grid grid-cols-3 gap-4 w-full text-left items-center">
                      <div className="flex items-center gap-2 font-medium text-left">
                        <p>{summary.employee.full_name}</p>
                        {summary.hasAnomalousShift && <AlertTriangle className="h-4 w-4 text-yellow-600" title="Contiene turnos de más de 18h" />}
                      </div>
                      <p className="text-right">{summary.hours.toFixed(2)}</p>
                      <p className="text-right">${(summary.hours * (summary.employee.hourly_rate || 0)).toFixed(2)}</p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-0 m-0">
                    <div className="px-4 py-4 bg-gray-50/50 rounded-b-lg border-x border-b">
                      <h4 className="text-xs font-semibold mb-2 text-gray-500 uppercase tracking-wider">Desglose de Actividad</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="h-8">Día</TableHead>
                            <TableHead className="h-8">Duración</TableHead>
                            <TableHead className="h-8 text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {summary.shifts.map((shift) => {
                            const formattedDuration = shift.duration || '-';
                            const dayString = format(new Date(shift.entryTimestamp), 'eeee d', { locale: es });
                            const capitalizedDayString = dayString.charAt(0).toUpperCase() + dayString.slice(1);

                            return (
                              <TableRow key={shift.id}>
                                <TableCell className="py-2 font-medium">{capitalizedDayString}</TableCell>
                                <TableCell className="py-2">{formattedDuration}</TableCell>
                                <TableCell className="py-2 text-right space-x-1">
                                  <Button variant="outline" size="sm" onClick={() => setEditingShift(shift)}>
                                    Editar
                                  </Button>
                                  {!shift.exitTimestamp && (
                                    <Button variant="secondary" size="sm" onClick={() => setCorrectingShift(shift)}>
                                      Corregir
                                    </Button>
                                  )}
                                  <Button variant="destructive" size="sm" onClick={() => setDeletingShift(shift)}>
                                    Eliminar
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {editingShift && (
        <EditShiftDialog
          shift={editingShift}
          isOpen={!!editingShift}
          onClose={() => setEditingShift(null)}
        />
      )}
      {correctingShift && (
        <ManualExitDialog
          shift={correctingShift}
          isOpen={!!correctingShift}
          onClose={() => setCorrectingShift(null)}
        />
      )}
      <AlertDialog open={!!deletingShift} onOpenChange={(isOpen) => !isOpen && setDeletingShift(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción es permanente y eliminará la actividad. No podrás deshacerla.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm}>
                    Sí, eliminar actividad
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WeeklySummary;
