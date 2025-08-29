const API_URL = 'https://script.google.com/macros/s/AKfycbw-4DzC6HrU1iw4cB9EZAhs5WFlkWIkXnhPIL9jy_3hwfGImfwOCliPQnqw4KQjvd7Whw/exec';

import { Employee, TimeLog, ApiResponse } from '@/types';

export const apiService = {
  async fetchData(): Promise<{ employees: any[][], logs: any[][] }> {
    console.log('Attempting to fetch data from API_URL:', API_URL);
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    // The backend now returns raw arrays, just pass them through
    return response.json();
  },

  async addRow(sheetName: string, rowData: any[]): Promise<{ newRow: number, writtenData: any[] }> {
    const formData = new FormData();
    formData.append('action', 'addRow');
    formData.append('sheetName', sheetName);
    formData.append('rowData', JSON.stringify(rowData)); // Send as JSON string

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Failed to add row');
    const result = await response.json();
    if (!result.success || !result.data) throw new Error(result.message || 'Invalid response');
    return result.data;
  },

  async updateCell(sheetName: string, row: number, col: number, value: any): Promise<{ updatedCell: string }> {
    const formData = new FormData();
    formData.append('action', 'updateCell');
    formData.append('sheetName', sheetName);
    formData.append('row', row.toString());
    formData.append('col', col.toString());
    formData.append('value', value.toString());

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Failed to update cell');
    const result = await response.json();
    if (!result.success || !result.data) throw new Error(result.message || 'Invalid response');
    return result.data;
  },

  async deleteRow(sheetName: string, row: number): Promise<{ deletedRow: number }> {
    const formData = new FormData();
    formData.append('action', 'deleteRow');
    formData.append('sheetName', sheetName);
    formData.append('row', row.toString());

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Failed to delete row');
    const result = await response.json();
    if (!result.success || !result.data) throw new Error(result.message || 'Invalid response');
    return result.data;
  },

  async verifyPassword(password: string): Promise<{ success: boolean }> {
    const formData = new FormData();
    formData.append('action', 'verifyAdminPassword');
    formData.append('password', password);

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Password verification request failed');
    }

    const result = await response.json();
    return result.data;
  }
};
