import { Employee, EmployeeCreationData } from '@/types'; // Asumimos que Employee se importa desde types

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

/**
 * Obtiene todos los empleados de una compañía específica.
 * @param companyId El ID de la compañía.
 * @returns Una promesa que se resuelve en un array de empleados.
 */
export const getEmployeesByCompany = async (companyId: string): Promise<Employee[]> => {
  console.log(`Fetching employees for company ID: ${companyId}`);
  const response = await fetch(`${API_URL}/employees/by-company/${companyId}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

/**
 * Crea un nuevo empleado.
 * @param employeeData Los datos del nuevo empleado (incluyendo email, password, etc.).
 * @param companyId El ID de la compañía a la que pertenece el empleado.
 * @returns Una promesa que se resuelve con el objeto del empleado creado.
 */
export const createEmployee = async (employeeData: EmployeeCreationData, companyId: string): Promise<Employee> => {
  const response = await fetch(`${API_URL}/employees`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...employeeData, companyId }), // Incluimos companyId en el cuerpo
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Intenta obtener detalles del error
    throw new Error(errorData.error || 'No se pudo crear el empleado');
  }

  return response.json();
};


// --- Funciones por migrar ---

// TODO: Migrar este endpoint al nuevo backend
// export const addLog = async (data) => { ... }

// TODO: Migrar este endpoint al nuevo backend
// export const addEmployee = async (data) => { ... }

// ... y así con el resto de funciones antiguas ...

/**
 * Elimina un empleado por su ID.
 * @param employeeId El ID del empleado a eliminar.
 * @returns Una promesa que se resuelve cuando la operación es exitosa.
 */
export const deleteEmployeeById = async (employeeId: string): Promise<void> => {
  console.log(`Attempting to delete employee with ID: ${employeeId}`);
  const response = await fetch(`${API_URL}/employees/${employeeId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    // Si el servidor responde con un error, lo lanzamos
    const errorData = await response.json().catch(() => ({})); // Intenta parsear el error, si no, objeto vacío
    throw new Error(errorData.error || 'Network response was not ok');
  }

  // Para un DELETE exitoso (status 204), no hay cuerpo que devolver.
};

/**
 * Actualiza un empleado por su ID.
 * @param employeeId El ID del empleado a actualizar.
 * @param data Los datos a actualizar (ej. { full_name, hourly_rate }).
 * @returns Una promesa que se resuelve con los datos del empleado actualizado.
 */
export const updateEmployeeById = async (employeeId: string, data: Partial<Employee>): Promise<Employee> => {
  console.log(`Attempting to update employee ${employeeId} with data:`, data);
  const response = await fetch(`${API_URL}/employees/${employeeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Network response was not ok');
  }

  return response.json();
};