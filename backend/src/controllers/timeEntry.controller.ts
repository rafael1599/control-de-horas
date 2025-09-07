import { Request, Response } from 'express';
import * as timeEntryService from '../services/timeEntry.service';

/**
 * Controlador para manejar el fichaje (entrada/salida) de un empleado.
 */
export const clock = async (req: Request, res: Response) => {
  try {
    const { employeeId, companyId } = req.body;

    if (!employeeId || !companyId) {
      return res.status(400).json({ error: "Faltan employeeId o companyId" });
    }

    const result = await timeEntryService.clockEmployee(employeeId, companyId);

    // Determinar si fue una entrada o una salida para el mensaje de respuesta
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