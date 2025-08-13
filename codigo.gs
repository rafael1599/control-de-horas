// --- Nombres de las Hojas ---
const LOG_SHEET_NAME = "Registros";
const EMPLOYEE_SHEET_NAME = "Empleados";
const DEBUG_SHEET_NAME = "Debug";

// --- Función Principal GET ---
function doGet(e) {
  try {
    const employees = getEmployees();
    const logs = getLogs();
    return ContentService
      .createTextOutput(JSON.stringify({ employees, logs }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return handleError(error);
  }
}

// --- Función Principal POST ---
function doPost(e) {
  try {
    debugLog("doPost received event: " + JSON.stringify(e));
    const action = e.parameter.action;
    debugLog("Action received: " + action);
    debugLog("e.parameter content: " + JSON.stringify(e.parameter));

    let result = {};

    switch(action) {
      case 'addLog':
        result = addLog(e.parameter);
        break;
      case 'updateLog':
        result = updateLog(e.parameter);
        break;
      case 'updateShift':
        result = updateShift(e.parameter);
        break;
      case 'deleteLog':
        result = deleteLog(e.parameter.row);
        break;
      case 'deleteShift':
        result = deleteShift(e.parameter);
        break;
      case 'addEmployee':
        result = addEmployee(e.parameter);
        break;
      case 'updateEmployee':
        result = updateEmployee(e.parameter);
        break;
      case 'deleteEmployee':
        result = deleteEmployee(e.parameter.id);
        break;
      default:
        throw new Error("Acción no reconocida: " + action);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', data: result }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return handleError(error);
  }
}


// --- FUNCIONES PARA MANEJAR EMPLEADOS ---

function getEmployees() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(EMPLOYEE_SHEET_NAME);
  if (!sheet) {
    return createInitialEmployeeSheet();
  }
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  
  return data.map(row => {
    let employee = {};
    headers.forEach((header, i) => {
      employee[header] = row[i];
    });
    return employee;
  });
}

function addEmployee(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(EMPLOYEE_SHEET_NAME);
  sheet.appendRow([`'${data.id}`, data.name, data.rate]);
  return { id: data.id, name: data.name };
}

function updateEmployee(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(EMPLOYEE_SHEET_NAME);
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0].toString() == data.id.toString()) {
      sheet.getRange(i + 1, 1).setValue(`'${data.id}`);
      sheet.getRange(i + 1, 2).setValue(data.name);
      sheet.getRange(i + 1, 3).setValue(data.rate);
      return { id: data.id };
    }
  }
  throw new Error("No se encontró el empleado con ID: " + data.id);
}

function deleteEmployee(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(EMPLOYEE_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i > 0; i--) {
    if (data[i][0].toString() == id.toString()) {
      sheet.deleteRow(i + 1);
      return { id };
    }
  }
}


// --- FUNCIONES PARA MANEJAR REGISTROS DE HORAS ---

function getLogs() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOG_SHEET_NAME);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  data.shift(); // Quitar cabecera
  
  return data.map((row, index) => ({
    timestamp: new Date(row[0]).toISOString(),
    employeeId: row[1].toString(),
    type: row[3],
    source: row[4],
    row: index + 2
  }));
}

function addLog(data) {
  try {
    debugLog("--- addLog START ---");
    debugLog("Received data: " + JSON.stringify(data));

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOG_SHEET_NAME);
    if (!sheet) {
      debugLog("Error: Log sheet not found!");
      throw new Error("La hoja de 'Registros' no fue encontrada.");
    }

    const employees = getEmployees();
    const employee = employees.find(e => e.id.toString() == data.employeeId.toString());
    const employeeName = employee ? employee.name : "Desconocido";
    debugLog("Found employee: " + employeeName);
    
    const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
    const source = data.source || data.entryType || 'Automático';

    const rowData = [
      timestamp,
      `'${data.employeeId}`,
      employeeName,
      data.type,
      source
    ];

    debugLog("Data to be appended: " + JSON.stringify(rowData));
    sheet.appendRow(rowData);
    debugLog("Row appended. --- addLog END ---");

    return { written: timestamp.toISOString() };

  } catch (error) {
    debugLog("CRITICAL ERROR in addLog: " + error.toString());
    throw error;
  }
}

function updateLog(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOG_SHEET_NAME);
  const row = parseInt(data.row);
  sheet.getRange(row, 1).setValue(new Date(data.timestamp));
  return { row };
}

function updateShift(data) {
  debugLog("--- updateShift START ---");
  debugLog("Received data: " + JSON.stringify(data));
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOG_SHEET_NAME);
  const entryRow = parseInt(data.entryRow);
  const exitRow = parseInt(data.exitRow);

  // Actualizar la fila de ENTRADA
  sheet.getRange(entryRow, 1).setValue(new Date(data.entryTimestamp));
  sheet.getRange(entryRow, 5).setValue('Manual Edit'); // Columna E (Source)

  // Actualizar la fila de SALIDA
  sheet.getRange(exitRow, 1).setValue(new Date(data.exitTimestamp));
  sheet.getRange(exitRow, 5).setValue('Manual Edit'); // Columna E (Source)

  debugLog("--- updateShift END ---");
  return { updatedRows: [entryRow, exitRow] };
}

function deleteLog(row) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOG_SHEET_NAME);
  sheet.deleteRow(parseInt(row));
  return { row };
}

function deleteShift(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOG_SHEET_NAME);
  const entryRow = parseInt(data.entryRow);
  const exitRow = parseInt(data.exitRow);

  debugLog(`--- deleteShift START --- Deleting rows: ${entryRow} and ${exitRow}`);

  if (entryRow > exitRow) {
    sheet.deleteRow(entryRow);
    sheet.deleteRow(exitRow);
  } else {
    sheet.deleteRow(exitRow);
    sheet.deleteRow(entryRow);
  }

  debugLog("--- deleteShift END ---");
  return { deletedRows: [entryRow, exitRow] };
}


// --- FUNCIONES AUXILIARES ---
function createInitialEmployeeSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.insertSheet(EMPLOYEE_SHEET_NAME);
  const initialEmployees = [
    ['id', 'name', 'rate'],
    ["'737", 'Mario', 15],
    ["'690", 'Gerardo', 15],
    ["'2003", 'Heidy', 15],
    ["'13", 'Joselin', 15],
    ["'2006", 'Andrea', 15],
    ["'21", 'Silvana', 15],
    ["'2010", 'Neyda', 15],
    ["'1014", 'Juliza', 15],
    ["'146", 'Jenn', 15],
    ["'050", 'Rafael', 15]
  ];
  sheet.getRange(1, 1, initialEmployees.length, 3).setValues(initialEmployees);
  sheet.getRange("A:A").setNumberFormat('@');
  return getEmployees();
}

function handleError(error) {
  debugLog("handleError triggered: " + error.toString());
  return ContentService
    .createTextOutput(JSON.stringify({ status: "error", message: error.message }))
    .setMimeType(ContentService.MimeType.JSON);
}

function debugLog(message) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let debugSheet = ss.getSheetByName(DEBUG_SHEET_NAME);
  if (!debugSheet) {
    debugSheet = ss.insertSheet(DEBUG_SHEET_NAME);
    debugSheet.appendRow(["Timestamp", "Message"]);
  }
  debugSheet.appendRow([new Date(), message]);
}