
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Servicio para obtener todos los empleados de una compañía
export const getAllEmployeesByCompany = async (companyId: string, status: 'active' | 'inactive' = 'active') => {
  const employees = await prisma.employee.findMany({
    where: { 
      companyId,
      isActive: status === 'active'
    },
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
export const createEmployee = async (employeeData: { full_name: string; email: string; password: string; hourly_rate?: number; employee_code?: string }, companyId: string) => {
  const { full_name, email, password, hourly_rate, employee_code } = employeeData;
  const password_hash = `hashed_${password}`; // TODO: Replace with bcrypt

  return await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email,
        password_hash,
        role: 'EMPLOYEE',
        company: {
          connect: {
            id: companyId,
          },
        },
      },
    });

    const newEmployeeProfile = await tx.employee.create({
      data: {
        full_name: full_name,
        employee_code: employee_code || null, // Asegurarse de que sea null si está vacío
        hourly_rate: hourly_rate ? parseFloat(hourly_rate.toString()) : null,
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
    const employeeToDeactivate = await tx.employee.findUnique({
      where: { id: employeeId },
      select: { userId: true },
    });

    if (!employeeToDeactivate) {
      throw new Error('Miembro no encontrado');
    }

    // 1. Desactivar el registro del empleado
    const deactivatedEmployee = await tx.employee.update({
      where: { id: employeeId },
      data: { isActive: false },
    });

    // 2. Desactivar el usuario asociado
    await tx.user.update({
      where: { id: employeeToDeactivate.userId },
      data: { isActive: false },
    });

    return deactivatedEmployee;
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

// Servicio para reactivar un empleado por su ID
export const reactivateEmployeeById = async (employeeId: string) => {
  return await prisma.$transaction(async (tx) => {
    const employeeToReactivate = await tx.employee.findUnique({
      where: { id: employeeId },
      select: { userId: true },
    });

    if (!employeeToReactivate) {
      throw new Error('Miembro no encontrado');
    }

    // 1. Reactivar el registro del empleado
    const reactivatedEmployee = await tx.employee.update({
      where: { id: employeeId },
      data: { isActive: true },
    });

    // 2. Reactivar el usuario asociado
    await tx.user.update({
      where: { id: employeeToReactivate.userId },
      data: { isActive: true },
    });

    return reactivatedEmployee;
  });
};
