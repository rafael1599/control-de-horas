export interface Employee {
  id: string;
  full_name: string;
  employee_code?: string;
  email?: string;
  password?: string;
  hourly_rate?: number;
  createdAt: string;
}

// Nuevo tipo para la creación de empleados desde el formulario
export interface EmployeeCreationData {
  employee_code?: string;
  fullName: string;
  email?: string;
  password?: string;
  hourlyRate?: number;
}

export interface TimeLog {
  timestamp: string;
  employeeId: string;
  type: 'ENTRADA' | 'SALIDA';
  source: string;
  row: number;
  shiftId?: string; // <-- AÑADIDO
  entryType?: 'Manual' | 'Automático';
}

export interface ApiResponse {
  employees: Employee[];
  logs: TimeLog[];
}

export interface Shift {
  id: string;
  employeeId: string;
  entryTimestamp: string;
  exitTimestamp?: string;
  entryRow: number;
  exitRow?: number;
}

export interface ProcessedShift extends Shift {
  employeeName: string;
  duration?: number;
  isAnomalous: boolean;
}

export interface OpenShift {
  employeeId: string;
  employeeName: string;
  entryTimestamp: Date;
  liveDuration: string;
}