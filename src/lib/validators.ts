import { isAfter, isBefore, differenceInMinutes } from 'date-fns';
import { type ProcessedShift, type TimeLog } from '@/types'; // Import types needed for validation functions
import { VALIDATION_MESSAGES } from '@/lib/messages';

export const MAX_SHIFT_HOURS = 18;
export const MAX_SHIFT_MINUTES = MAX_SHIFT_HOURS * 60;
export const FAST_CLOCK_IN_THRESHOLD_MINUTES = 5;

// General utilities
export function areAllFieldsFilled(...fields: any[]): boolean {
  return fields.every(field => field !== undefined && field !== null && field !== '');
}

export function isShiftDurationValid(entryTime: Date, exitTime: Date): boolean {
  return isAfter(exitTime, entryTime);
}

export function isNotInFuture(date: Date): boolean {
  return isBefore(date, new Date()) || date.toDateString() === new Date().toDateString();
}

// Interface for validation results
interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// Specific validation functions for dialogs and actions

export function validateAddShift(employeeId: string | undefined, entryTime: Date | undefined, exitTime: Date | undefined): ValidationResult {
  if (!areAllFieldsFilled(employeeId, entryTime, exitTime)) {
    return { isValid: false, message: VALIDATION_MESSAGES.ALL_FIELDS_REQUIRED };
  }

  if (!isNotInFuture(entryTime!) || !isNotInFuture(exitTime!)) {
    return { isValid: false, message: VALIDATION_MESSAGES.NO_FUTURE_HOURS };
  }

  if (!isShiftDurationValid(entryTime!, exitTime!)) {
    return { isValid: false, message: VALIDATION_MESSAGES.EXIT_TIME_AFTER_ENTRY_REQUIRED };
  }

  if (differenceInMinutes(exitTime!, entryTime!) > MAX_SHIFT_MINUTES) {
    return { isValid: false, message: VALIDATION_MESSAGES.SHIFT_TOO_LONG };
  }

  return { isValid: true };
}

export function validateEditShift(entryTime: Date | undefined, exitTime: Date | undefined, shift: ProcessedShift): ValidationResult {
  if (!areAllFieldsFilled(entryTime, exitTime)) {
    return { isValid: false, message: "Por favor, completa todos los campos." };
  }
  if (!shift.exitRow) { // Ensure it's a closed shift for editing
    return { isValid: false, message: VALIDATION_MESSAGES.NO_EXIT_REGISTERED };
  }

  if (!isShiftDurationValid(entryTime!, exitTime!)) {
    return { isValid: false, message: VALIDATION_MESSAGES.EXIT_TIME_AFTER_ENTRY_REQUIRED };
  }

  if (differenceInMinutes(exitTime!, entryTime!) > MAX_SHIFT_MINUTES) {
    return { isValid: false, message: VALIDATION_MESSAGES.SHIFT_TOO_LONG };
  }

  if (!isNotInFuture(exitTime!)) { // Only check exit time, entry time could be old
    return { isValid: false, message: "No se pueden registrar horas en el futuro." };
  }

  return { isValid: true };
}

export function validateManualExit(exitTime: Date | undefined, minDate: Date, maxDate: Date): ValidationResult {
  if (!areAllFieldsFilled(exitTime)) {
    return { isValid: false, message: VALIDATION_MESSAGES.SELECT_EXIT_TIME };
  }

  if (!isNotInFuture(exitTime!)) {
    return { isValid: false, message: "No se pueden registrar horas en el futuro." };
  }

  if (isAfter(exitTime!, maxDate) || isBefore(exitTime!, minDate)) {
    return { isValid: false, message: VALIDATION_MESSAGES.EXIT_TIME_OUT_OF_RANGE(MAX_SHIFT_HOURS) };
  }

  return { isValid: true };
}

// This validation is complex and depends on current logs, so it's slightly different
export function validateClockAction(employeeId: string, type: 'ENTRADA' | 'SALIDA', displayLogs: TimeLog[], lastLog: TimeLog | undefined, lastClockOutTime: string): ValidationResult {
  // Common checks for both ENTRADA and SALIDA
  if (!employeeId) {
    return { isValid: false, message: VALIDATION_MESSAGES.SELECT_EMPLOYEE };
  }

  // SALIDA specific validations
  if (type === 'SALIDA') {
    if (!lastLog || lastLog.type === 'SALIDA') {
      // This case triggers a dialog, not an error toast directly
      return { isValid: false, message: VALIDATION_MESSAGES.NO_OPEN_ENTRY_OR_ALREADY_EXIT };
    }
    if (differenceInMinutes(new Date(), new Date(lastLog.timestamp)) > MAX_SHIFT_MINUTES) {
      // This case triggers a dialog, not an error toast directly
      return { isValid: false, message: VALIDATION_MESSAGES.EXCESSIVELY_LONG_SHIFT };
    }
  }

  // ENTRADA specific validations
  if (type === 'ENTRADA') {
    if (lastLog && lastLog.type === 'ENTRADA') {
      return { isValid: false, message: VALIDATION_MESSAGES.ALREADY_OPEN_ENTRY };
    }
    // Fast clock-in check (triggers a warning dialog, not an error toast directly)
    if (lastLog && lastLog.type === 'SALIDA' && differenceInMinutes(new Date(), new Date(lastLog.timestamp)) < FAST_CLOCK_IN_THRESHOLD_MINUTES) {
      return { isValid: false, message: VALIDATION_MESSAGES.FAST_CLOCK_IN_AFTER_OUT };
    }
  }

  return { isValid: true };
}
