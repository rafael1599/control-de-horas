import { PrismaClient, TimeEntry } from '@prisma/client';

const prisma = new PrismaClient();

export const clockEmployee = async (employeeId: string, companyId: string): Promise<TimeEntry> => {
  const openTimeEntry = await prisma.timeEntry.findFirst({
    where: {
      employeeId: employeeId,
      end_time: null,
    },
  });

  if (openTimeEntry) {
    const updatedTimeEntry = await prisma.timeEntry.update({
      where: { id: openTimeEntry.id },
      data: { end_time: new Date() },
    });
    console.log(`Clock-out for employee ${employeeId}. Shift ID: ${updatedTimeEntry.id}`);
    return updatedTimeEntry;
  }
  
  else {
    const newTimeEntry = await prisma.timeEntry.create({
      data: {
        start_time: new Date(),
        employeeId,
        companyId,
      },
    });
    console.log(`Clock-in for employee ${employeeId}. New Shift ID: ${newTimeEntry.id}`);
    return newTimeEntry;
  }
};

export const getTimeEntriesByCompany = async (companyId: string): Promise<TimeEntry[]> => {
  const timeEntries = await prisma.timeEntry.findMany({
    where: { companyId },
    orderBy: {
      start_time: 'desc',
    },
  });
  return timeEntries;
};

export const createManualShift = async (data: {
  employeeId: string;
  companyId: string;
  start_time: Date;
  end_time: Date;
}): Promise<TimeEntry> => {
  const newTimeEntry = await prisma.timeEntry.create({
    data: {
      employeeId: data.employeeId,
      companyId: data.companyId,
      start_time: data.start_time,
      end_time: data.end_time,
    },
  });
  return newTimeEntry;
};

export const deleteShiftById = async (timeEntryId: string): Promise<void> => {
  await prisma.timeEntry.delete({
    where: { id: timeEntryId },
  });
};

/**
 * Actualiza un registro de tiempo por su ID.
 * @param timeEntryId El ID del registro a actualizar.
 * @param data Los datos a actualizar (start_time y/o end_time).
 * @returns El registro de tiempo actualizado.
 */
export const updateShiftById = async (timeEntryId: string, data: { start_time?: Date; end_time?: Date }): Promise<TimeEntry> => {
  const updatedTimeEntry = await prisma.timeEntry.update({
    where: { id: timeEntryId },
    data,
  });
  return updatedTimeEntry;
};
