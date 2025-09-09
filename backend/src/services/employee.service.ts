
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Servicio para obtener todos los empleados de una compañía
export const getAllEmployeesByCompany = async (companyId: string) => {
  const employees = await prisma.employee.findMany({
    where: { companyId },
    orderBy: { createdAt: 'asc' },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  return employees.map(employee => {
    const { user, ...rest } = employee;
    const employeeWithEmail = { ...rest, email: user?.email || undefined };
    return employeeWithEmail;
  });
};

// Servicio para crear un nuevo empleado
export const createEmployee = async (employeeData: { fullName: string; email: string; password: string; hourlyRate?: number; employee_code?: string }, companyId: string) => {
  const { fullName, email, password, hourlyRate, employee_code } = employeeData;
  const password_hash = `hashed_${password}`; // TODO: Replace with bcrypt

  return await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email,
        password_hash,
        role: 'EMPLOYEE',
        companyId,
      },
    });

    const newEmployeeProfile = await tx.employee.create({
      data: {
        full_name: fullName,
        employee_code: employee_code || null, // Asegurarse de que sea null si está vacío
        hourly_rate: hourlyRate ? parseFloat(hourlyRate.toString()) : null,
        companyId,
        userId: newUser.id,
      },
    });

    return newEmployeeProfile;
  });
};

// Servicio para eliminar un empleado por su ID
export const deleteEmployeeById = async (employeeId: string) => {
  return await prisma.$transaction(async (tx) => {
    const employeeToDelete = await tx.employee.findUnique({
      where: { id: employeeId },
      select: { userId: true },
    });

    if (!employeeToDelete) {
      throw new Error('Empleado no encontrado');
    }

    await tx.employee.delete({
      where: { id: employeeId },
    });

    await tx.user.delete({
      where: { id: employeeToDelete.userId },
    });
  });
};

// Servicio para actualizar un empleado por su ID
export const updateEmployeeById = async (employeeId: string, data: { full_name?: string; hourly_rate?: number; employee_code?: string }) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    throw new Error('Empleado no encontrado');
  }

  return await prisma.employee.update({
    where: { id: employeeId },
    data: {
      full_name: data.full_name,
      employee_code: data.employee_code,
      hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate.toString()) : undefined,
    },
  });
};
