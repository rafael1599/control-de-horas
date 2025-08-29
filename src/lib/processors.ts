import { type Employee, type TimeLog } from '@/types';

// The raw employee data from the sheet is expected to be [id, name, rate]
export function processRawEmployees(rawData: any[][]): Employee[] {
  if (!rawData || !Array.isArray(rawData)) return [];
  return rawData.map((row) => ({
    id: row[0]?.toString().replace(/'/g, '') || '',
    name: row[1]?.toString() || '',
    rate: Number(row[2]) || 0,
  }));
}

// The raw log data from the sheet is expected to be [timestamp, employeeId, employeeName, type, source]
export function processRawLogs(rawData: any[][]): TimeLog[] {
  if (!rawData || !Array.isArray(rawData)) return [];
  return rawData.map((row, index) => ({
    id: `${row[1]?.toString()}-${row[0]?.toString()}`, // Create a synthetic ID
    timestamp: new Date(row[0]).toISOString(),
    employeeId: row[1]?.toString().replace(/'/g, '') || '', // Remove leading apostrophe if present
    // row[2] is employeeName, which we don't store in TimeLog type
    type: row[3]?.toString() as 'ENTRADA' | 'SALIDA',
    source: row[4]?.toString() || 'Automático',
    row: index + 2, // +1 for 0-based index, +1 for shifted header
  }));
}