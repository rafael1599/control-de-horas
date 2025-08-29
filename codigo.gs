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

    let result = {};

    switch(action) {
      case 'addRow':
        result = addRow(e.parameter);
        break;
      case 'updateCell':
        result = updateCell(e.parameter);
        break;
      case 'deleteRow':
        result = deleteRow(e.parameter);
        break;
      case 'verifyAdminPassword': // Kept for authentication
        result = doVerifyAdminPassword(e.parameter);
        break;
      default:
        throw new Error("Acción no reconocida: " + action);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, data: result }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return handleError(error);
  }
}

// --- NUEVA FUNCIÓN DE AUTENTICACIÓN ---

function doVerifyAdminPassword(params) {
  try {
    debugLog("--- doVerifyAdminPassword START ---");
    const storedPassword = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
    const suppliedPassword = params.password;

    if (!storedPassword) {
      debugLog("CRITICAL: ADMIN_PASSWORD property is not set in Script Properties.");
      throw new Error("La contraseña de administrador no ha sido configurada en el servidor.");
    }

    const success = (storedPassword === suppliedPassword);
    debugLog("Password verification result: " + (success ? "SUCCESS" : "FAILURE"));
    debugLog("--- doVerifyAdminPassword END ---");
    
    return { success: success };

  } catch (error) {
    debugLog("CRITICAL ERROR in doVerifyAdminPassword: " + error.toString());
    throw error;
  }
}


// --- FUNCIONES PARA MANEJAR EMPLEADOS (Lectura) ---

function getEmployees() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(EMPLOYEE_SHEET_NAME);
  if (!sheet) {
    // This will create the sheet and then the client can refetch.
    createInitialEmployeeSheet();
    return []; 
  }
  const data = sheet.getDataRange().getValues();
  data.shift(); // Remove header row
  return data;
}


// --- NUEVAS FUNCIONES DE MANIPULACIÓN DE DATOS ---

function addRow(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(params.sheetName);
  // The rowData parameter should be a JSON stringified array of values
  const rowData = JSON.parse(params.rowData);
  sheet.appendRow(rowData);
  const newRow = sheet.getLastRow();
  return { newRow: newRow, writtenData: rowData };
}

function updateCell(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(params.sheetName);
  const row = parseInt(params.row);
  const col = parseInt(params.col);
  sheet.getRange(row, col).setValue(params.value);
  return { updatedCell: `${params.sheetName}!R${row}C${col}` };
}

function deleteRow(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(params.sheetName);
  const row = parseInt(params.row);
  sheet.deleteRow(row);
  return { deletedRow: row, sheetName: params.sheetName };
}


// --- FUNCIONES PARA MANEJAR REGISTROS DE HORAS (Lectura) ---

function getLogs() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOG_SHEET_NAME);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  data.shift(); // Quitar cabecera
  return data;
}

// --- NUEVA FUNCIÓN DE AUTENTICACIÓN ---

function doVerifyAdminPassword(params) {
  try {
    debugLog("--- doVerifyAdminPassword START ---");
    const storedPassword = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
    const suppliedPassword = params.password;

    if (!storedPassword) {
      debugLog("CRITICAL: ADMIN_PASSWORD property is not set in Script Properties.");
      throw new Error("La contraseña de administrador no ha sido configurada en el servidor.");
    }

    const success = (storedPassword === suppliedPassword);
    debugLog("Password verification result: " + (success ? "SUCCESS" : "FAILURE"));
    debugLog("--- doVerifyAdminPassword END ---");
    
    return { success: success };

  } catch (error) {
    debugLog("CRITICAL ERROR in doVerifyAdminPassword: " + error.toString());
    throw error;
  }
}


// --- FUNCIONES PARA MANEJAR EMPLEADOS ---

function getEmployees() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(EMPLOYEE_SHEET_NAME);
  if (!sheet) {
    // This will create the sheet and then the client can refetch.
    createInitialEmployeeSheet();
    return []; 
  }
  const data = sheet.getDataRange().getValues();
  data.shift(); // Remove header row
  return data;
}








// --- FUNCIONES PARA MANEJAR REGISTROS DE HORAS ---

function getLogs() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOG_SHEET_NAME);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  data.shift(); // Quitar cabecera
  return data;
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
    .createTextOutput(JSON.stringify({ success: false, message: error.message }))
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