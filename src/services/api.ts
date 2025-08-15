const API_URL = 'https://script.google.com/macros/s/AKfycby31Vba4JDQPbAnaPFrBe53Ch3QvLVNNlRjgvqdaUasuJJNccXInE9oIMBZdgG6y9hrxA/exec';

import { Employee, TimeLog, ApiResponse } from '@/types';

export const apiService = {
  async fetchData(): Promise<ApiResponse> {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    return response.json();
  },

  async addLog(employeeId: string, type: 'ENTRADA' | 'SALIDA', timestamp?: string, source: 'Manual' | 'Automático' = 'Automático'): Promise<void> {
    const formData = new FormData();
    formData.append('action', 'addLog');
    formData.append('employeeId', employeeId);
    formData.append('type', type);
    if (timestamp) {
      formData.append('timestamp', timestamp);
    }
    formData.append('source', source);

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to add log');
    }
  },

  async addEmployee(employee: Employee): Promise<void> {
    const formData = new FormData();
    formData.append('action', 'addEmployee');
    formData.append('id', employee.id);
    formData.append('name', employee.name);
    formData.append('rate', employee.rate.toString());

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to add employee');
    }
  },

  async updateEmployee(employee: Employee): Promise<void> {
    const formData = new FormData();
    formData.append('action', 'updateEmployee');
    formData.append('id', employee.id);
    formData.append('name', employee.name);
    formData.append('rate', employee.rate.toString());

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to update employee');
    }
  },

  async deleteEmployee(id: string): Promise<void> {
    const formData = new FormData();
    formData.append('action', 'deleteEmployee');
    formData.append('id', id);

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to delete employee');
    }
  },

  async updateLog(log: Partial<TimeLog> & { row: number }): Promise<void> {
    const formData = new FormData();
    formData.append('action', 'updateLog');
    formData.append('row', log.row.toString());
    if (log.timestamp) formData.append('timestamp', log.timestamp);
    if (log.type) formData.append('type', log.type);
    if (log.entryType) formData.append('entryType', log.entryType);

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to update log');
    }
  },

  async deleteLog(row: number): Promise<void> {
    const formData = new FormData();
    formData.append('action', 'deleteLog');
    formData.append('row', row.toString());

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to delete log');
    }
  },

  async deleteShift(entryRow: number, exitRow: number): Promise<void> {
    const formData = new FormData();
    formData.append('action', 'deleteShift');
    formData.append('entryRow', entryRow.toString());
    formData.append('exitRow', exitRow.toString());

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to delete shift');
    }
  },

  async updateShift(entryRow: number, exitRow: number, entryTimestamp: string, exitTimestamp: string): Promise<void> {
    const formData = new FormData();
    formData.append('action', 'updateShift');
    formData.append('entryRow', entryRow.toString());
    formData.append('exitRow', exitRow.toString());
    formData.append('entryTimestamp', entryTimestamp);
    formData.append('exitTimestamp', exitTimestamp);

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to update shift');
    }
  }
};
