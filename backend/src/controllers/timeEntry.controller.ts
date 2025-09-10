import { Request, Response } from 'express';
import * as timeEntryService from '../services/timeEntry.service';

// ... (existing functions)
export const clock = async (req: Request, res: Response) => {
  try {
    const { employeeId, companyId } = req.body;
    if (!employeeId || !companyId) {
      return res.status(400).json({ error: "Faltan employeeId o companyId" });
    }
    const result = await timeEntryService.clockEmployee(employeeId, companyId);
    const action = result.end_time ? 'salida' : 'entrada';
    res.status(201).json({
      message: `Registro de ${action} exitoso.`,
      timeEntry: result,
    });
  } catch (error) {
    console.error("Error during clock event:", error);
    res.status(500).json({ error: "Ocurrió un error durante el fichaje." });
  }
};

export const getCompanyTimeEntries = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    if (!companyId) {
      return res.status(400).json({ error: "Falta companyId en los parámetros de la URL" });
    }
    const timeEntries = await timeEntryService.getTimeEntriesByCompany(companyId);
    res.status(200).json(timeEntries);
  } catch (error) {
    console.error("Error fetching time entries:", error);
    res.status(500).json({ error: "Ocurrió un error al obtener los registros de tiempo." });
  }
};

export const createManualTimeEntry = async (req: Request, res: Response) => {
  try {
    const { employeeId, companyId, start_time, end_time } = req.body;
    if (!employeeId || !companyId || !start_time || !end_time) {
      return res.status(400).json({ error: "Faltan datos para crear el turno manual." });
    }
    const newTimeEntry = await timeEntryService.createManualShift({
      employeeId,
      companyId,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
    });
    res.status(201).json(newTimeEntry);
  } catch (error) {
    console.error("Error creating manual time entry:", error);
    res.status(500).json({ error: "Ocurrió un error al crear el turno manual." });
  }
};

export const deleteTimeEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Falta el ID del turno en los parámetros." });
    }
    await timeEntryService.deleteShiftById(id);
    res.status(200).json({ message: "Turno eliminado exitosamente." });
  } catch (error) {
    console.error("Error deleting time entry:", error);
    res.status(500).json({ error: "Ocurrió un error al eliminar el turno." });
  }
};

/**
 * Controlador para actualizar un registro de tiempo.
 */
export const updateTimeEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { start_time, end_time } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Falta el ID del turno en los parámetros." });
    }

    if (!start_time && !end_time) {
      return res.status(400).json({ error: "Faltan datos para actualizar (start_time o end_time)." });
    }

    const dataToUpdate: { start_time?: Date; end_time?: Date } = {};
    if (start_time) dataToUpdate.start_time = new Date(start_time);
    if (end_time) dataToUpdate.end_time = new Date(end_time);

    const updatedTimeEntry = await timeEntryService.updateShiftById(id, dataToUpdate);

    res.status(200).json(updatedTimeEntry);

  } catch (error) {
    console.error("Error updating time entry:", error);
    res.status(500).json({ error: "Ocurrió un error al actualizar el turno." });
  }
};