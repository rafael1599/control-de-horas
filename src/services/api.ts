import { Employee, EmployeeCreationData, TimeLog } from '@/types';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

export const getEmployeesByCompany = async (companyId: string): Promise<Employee[]> => {
  console.log(`Fetching employees for company ID: ${companyId}`);
  const response = await fetch(`${API_URL}/employees/by-company/${companyId}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const createEmployee = async (employeeData: EmployeeCreationData, companyId: string): Promise<Employee> => {
  const response = await fetch(`${API_URL}/employees`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...employeeData, companyId }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'No se pudo crear el empleado');
  }

  return response.json();
};

export const deleteEmployeeById = async (employeeId: string): Promise<void> => {
  console.log(`Attempting to delete employee with ID: ${employeeId}`);
  const response = await fetch(`${API_URL}/employees/${employeeId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Network response was not ok');
  }
};

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

export const clockInOut = async (employeeId: string, companyId: string) => {
  console.log(`Attempting to clock in/out for employee: ${employeeId}`);
  const response = await fetch(`${API_URL}/time-entries/clock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ employeeId, companyId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Network response was not ok');
  }

  return response.json();
};

export const getTimeEntriesByCompany = async (companyId: string): Promise<TimeLog[]> => {
  console.log(`Fetching time entries for company ID: ${companyId}`);
  const response = await fetch(`${API_URL}/time-entries/by-company/${companyId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Network response was not ok');
  }
  return response.json();
};

export const createManualShift = async (shiftData: { 
  employeeId: string; 
  companyId: string; 
  start_time: Date; 
  end_time: Date; 
}) => {
  const response = await fetch(`${API_URL}/time-entries/manual`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(shiftData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Network response was not ok');
  }

  return response.json();
};

export const deleteShift = async (shiftId: string) => {
  const response = await fetch(`${API_URL}/time-entries/${shiftId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Network response was not ok');
  }

  if (response.status !== 204) {
    return response.json();
  }
};

/**
 * Actualiza un turno por su ID.
 * @param shiftId El ID del turno a actualizar.
 * @param shiftData Los datos a actualizar.
 */
export const updateShift = async (shiftId: string, shiftData: { start_time?: Date; end_time?: Date }) => {
  const response = await fetch(`${API_URL}/time-entries/${shiftId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(shiftData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Network response was not ok');
  }

  return response.json();
};