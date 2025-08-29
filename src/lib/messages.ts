export const TOAST_MESSAGES = {
  CLOCK_IN_UNDO_SUCCESS: "El fichaje de entrada ha sido deshecho.",
  CLOCK_IN_SUCCESS: (employeeName: string) => `ENTRADA registrada para ${employeeName}`,
  ERROR_TITLE: "Error",
  CLOCK_IN_ERROR: "No se pudo registrar la entrada.",
  ACTION_ERROR: "No se pudo registrar la acción",
  ACTION_NOT_ALLOWED_TITLE: "Acción no permitida",
  PENDING_CLOCK_IN_DESCRIPTION: "Hay un fichaje de entrada pendiente.",
  CLOCK_OUT_SUCCESS: (employeeName: string) => `SALIDA registrada para ${employeeName}`,
  NETWORK_ERROR_TITLE: "Error de Red",
  CLOCK_OUT_ERROR: "No se pudo registrar la salida.",
  ALREADY_CLOCKED_IN: "Ya hay una entrada abierta para este empleado",
  FAST_CLOCK_IN_WARNING: "Entrada muy rápida después de una salida.",
  CLOCK_IN_UNDO_ERROR: "No se pudo registrar la entrada. Deshaciendo.",
  MANUAL_CLOCK_IN_MISSING_TIME: "Por favor, selecciona una fecha y hora de entrada",
  VALIDATION_ERROR_TITLE: "Error de Validación",
  EXIT_TIME_BEFORE_ENTRY_ERROR: "La hora de salida debe ser posterior a la hora de entrada.",
  SHIFT_DURATION_EXCEEDED: (maxHours: number) => `La duración del turno no puede exceder las ${maxHours} horas.`,
  EMPLOYEE_NOT_FOUND: "Empleado no encontrado.",
  SUCCESS_TITLE: "Éxito",
  MANUAL_CLOCK_IN_SUCCESS: (employeeName: string) => `Entrada manual y salida registrada para ${employeeName}`,
  MANUAL_CLOCK_IN_ERROR: "No se pudo registrar la entrada manual",
};

export const DIALOG_MESSAGES = {
  MANUAL_CLOCK_IN_TITLE: "Entrada Manual Olvidada",
  MANUAL_CLOCK_IN_DESCRIPTION: "No se encontró una entrada abierta. Se ha pre-calculado una hora de entrada 8 horas antes de este momento. Ajústala si es necesario.",
  CONFIRM_NEW_ENTRY_TITLE: "Confirmar Nueva Entrada",
  CONFIRM_NEW_ENTRY_DESCRIPTION: (lastClockOutTime: string) => `Acabas de registrar una salida a las ${lastClockOutTime}. ¿Estás seguro de que quieres iniciar un nuevo turno tan pronto?`,
  TURN_COMPLETED_TITLE: "Turno ya completado",
  TURN_COMPLETED_DESCRIPTION: "Ya has registrado una salida para tu turno actual. No puedes registrar otra salida sin antes haber registrado una nueva entrada. Si crees que esto es un error, por favor, contacta al administrador.",
  LONG_TURN_TITLE: "Turno Excesivamente Largo",
  LONG_TURN_DESCRIPTION: (maxHours: number) => `El sistema ha detectado que tu turno abierto ha superado las ${maxHours} horas. No se puede registrar la salida automáticamente. Por favor, contacta a un administrador para revisar y corregir tu registro.`,
};

export const BUTTON_LABELS = {
  UNDERSTOOD: "Entendido",
  YES_REGISTER_ENTRY: "Sí, registrar entrada",
  REGISTER_ENTRY_EXIT: "Registrar Entrada y Salida",
  CANCEL: "Cancelar",
};

export const LOADING_MESSAGES = {
  LOADING: "Cargando...",
};

export const VALIDATION_MESSAGES = {
  ALL_FIELDS_REQUIRED: "Por favor, completa todos los campos.",
  NO_FUTURE_HOURS: "No se pueden registrar horas en el futuro.",
  EXIT_TIME_AFTER_ENTRY_REQUIRED: "La hora de salida debe ser posterior a la hora de entrada.",
  SHIFT_TOO_LONG: "Turno demasiado largo. Por favor, ajusta las horas.",
  NO_EXIT_REGISTERED: "Este turno no tiene una salida registrada.",
  NO_OPEN_ENTRY_OR_ALREADY_EXIT: "No se encontró una entrada abierta o ya hay una salida registrada.",
  EXCESSIVELY_LONG_SHIFT: "Turno excesivamente largo.",
  ALREADY_OPEN_ENTRY: "Ya hay una entrada abierta para este empleado",
  FAST_CLOCK_IN_AFTER_OUT: "Entrada muy rápida después de una salida.",
  SELECT_EXIT_TIME: "Por favor, selecciona una fecha y hora de salida.",
  EXIT_TIME_OUT_OF_RANGE: (maxHours: number) => `La hora de salida debe estar entre el inicio del turno y el límite de ${maxHours} horas.`,
  SELECT_EMPLOYEE: "Por favor selecciona un empleado",
};
