import { PrismaClient, TimeEntry } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Registra una entrada o salida para un empleado.
 * Busca el último registro de tiempo del empleado:
 * - Si está abierto, lo cierra (clock-out).
 * - Si está cerrado o no existe, crea uno nuevo (clock-in).
 * @param employeeId El ID del empleado que está fichando.
 * @param companyId El ID de la compañía a la que pertenece el empleado.
 * @returns El registro de tiempo creado o actualizado.
 */
export const clockEmployee = async (employeeId: string, companyId: string): Promise<TimeEntry> => {
  // 1. Buscar el último registro de tiempo para este empleado
  const lastTimeEntry = await prisma.timeEntry.findFirst({
    where: { employeeId },
    orderBy: { start_time: 'desc' }, // Corrected
  });

  // 2. Si hay un último registro y no tiene hora de fin, es un clock-out
  if (lastTimeEntry && !lastTimeEntry.end_time) { // Corrected
    const updatedTimeEntry = await prisma.timeEntry.update({
      where: { id: lastTimeEntry.id },
      data: { end_time: new Date() }, // Corrected
    });
    return updatedTimeEntry;
  }
  
  // 3. De lo contrario, es un clock-in
  else {
    const newTimeEntry = await prisma.timeEntry.create({
      data: {
        start_time: new Date(), // Corrected
        employeeId,
        companyId,
        // projectId y locationId se pueden añadir aquí si se envían desde el frontend
      },
    });
    return newTimeEntry;
  }
};