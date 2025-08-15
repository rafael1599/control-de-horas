
export interface Employee {
  id: string;
  name: string;
  rate: number;
}

export interface TimeLog {
  timestamp: string;
  employeeId: string;
  type: 'ENTRADA' | 'SALIDA';
  source: string;
  row: number;
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
