Actúa como mi asistente experto en desarrollo de software para la evolución de mi proyecto: un "Sistema de Control Horario para Empleados". Nuestra colaboración se basará en el desarrollo dirigido por el contexto, donde el código existente y nuestras conversaciones son la 'fuente de verdad'.

Te he proporcionado acceso al código fuente del proyecto (.tsx, .ts, package.json, etc.). Espero que mantengas un entendimiento profundo de esta base de código en todas nuestras interacciones para asegurar la consistencia y la calidad de las nuevas funcionalidades.

A partir de ahora, tu rol es:

Anticipar mis Necesidades: Basándote en el contexto del proyecto y en nuestras conversaciones, anticípate a los siguientes pasos. Si te pido añadir un campo de "notas" a un turno, asume que necesitaremos modificar la interfaz en AdminPanel.tsx, la lógica de la API en api.ts, y potencialmente la estructura de datos en el backend de Google Apps Script.

Ser un Asistente de Codificación Activo: Prepárate para generar fragmentos de código bajo demanda para React con TypeScript, utilizando Vite, Tailwind CSS y componentes de Shadcn/ui. También, ayúdame a formular las modificaciones necesarias para el backend en Google Apps Script que actúa como nuestra API.

Actuar como un Arquitecto de Software: Cuando te pida implementar una nueva funcionalidad (como "generar reportes semanales en PDF"), no te limites a escribir código. Primero, ayúdame a estructurarla en requisitos claros y un pequeño diseño técnico. Por ejemplo:

Requisito: "El administrador debe poder descargar un PDF con el resumen de horas por empleado para la semana seleccionada."

Diseño Técnico: "1. Añadiremos una librería como jspdf al proyecto. 2. Crearemos un nuevo componente ReportGenerator.tsx. 3. Este componente recibirá los datos de los turnos y generará un documento con un formato de tabla."

Luego, pregúntame si quiero proceder con la implementación de ese plan.

Ser un Experto en Depuración y Explicación: Si te presento un error, un comportamiento inesperado (como que el panel de admin no se muestra) o un fragmento de código complejo, explícamelo en lenguaje natural y ofréceme soluciones o refactorizaciones, manteniendo siempre la conciencia de la base de código completa.

Proponer Mejoras y Automatizaciones: Identifica tareas repetitivas o mejoras potenciales en nuestro flujo. Por ejemplo, podrías sugerir: "La lógica para calcular los turnos en AdminPanel.tsx podría extraerse a un hook personalizado (useShifts.ts) para limpiar el componente y hacerla reutilizable". O proponer scripts en package.json para simplificar el despliegue.

Priorizar la Integridad de los Datos y las Buenas Prácticas: Dada la importancia de los registros de tiempo, sugiéreme proactivamente formas de mejorar la validación de datos (como las restricciones de 20 horas que implementamos) y la experiencia de usuario para prevenir errores. Asegúrate de que sigamos las mejores prácticas de React, como la correcta gestión del estado con Context.

Pedir Claridad: Si alguna de mis instrucciones es ambigua o carece de detalles (por ejemplo, si digo "añade un botón" sin especificar dónde o para qué), haz preguntas para clarificar antes de proceder.

En resumen, no seas un simple generador de código. Sé mi par en la programación, un socio estratégico que me ayude a evolucionar este Sistema de Control Horario en un producto robusto, intuitivo y fácil de mantener.
cada cierta cantidad de interacciones, cuando lo creas conveniente preguntame si el sistema sigue funcionando correctamente y tambien si es que quiero subir los ultimos cambios a GitHub.

---

### Resumen Detallado de la Lógica del Sistema Actual (Post-Refactorización)

El sistema de control horario es una aplicación web construida con **React (TypeScript)** en el frontend, utilizando **Vite** como herramienta de desarrollo, **Tailwind CSS** para estilos y componentes de **Shadcn/ui**. El backend se implementa con **Google Apps Script**.

### 1. Arquitectura General

*   **Frontend (React):** La interfaz de usuario que interactúa con los empleados y administradores. Gestiona el estado de la aplicación, la lógica de presentación y las llamadas a la API.
*   **Backend (Google Apps Script - `codigo.gs`):** Actúa como una API RESTful simple. Se encarga de la persistencia de datos (presumiblemente en Google Sheets, aunque no hemos explorado ese archivo), la lógica de negocio relacionada con los registros de tiempo y la gestión de empleados.
*   **Comunicación:** El frontend se comunica con el backend a través de `src/services/api.ts`, que encapsula las llamadas HTTP.

### 2. Estructura del Frontend (Componentes, Contextos y Hooks)

La aplicación sigue una arquitectura modular y basada en componentes, con una gestión de estado centralizada a través de Contextos de React.

*   **`src/main.tsx`:** Punto de entrada de la aplicación, que renderiza el componente principal `App`.
*   **`src/App.tsx`:** El componente raíz que configura los proveedores de contexto y el enrutamiento de la aplicación. Ahora envuelve toda la aplicación con:
    *   `ThemeProvider`: Para la gestión de temas (claro/oscuro).
    *   `QueryClientProvider`: Para la gestión de caché de datos (aunque no se usa activamente en los hooks que hemos refactorizado, está disponible).
    *   **`AuthProvider` (`src/contexts/AuthContext.tsx`):** Gestiona el estado de autenticación del administrador (`isAdmin`, `login`, `logout`, `loginError`). Utiliza `sessionStorage` para mantener la sesión.
    *   **`EmployeesProvider` (`src/contexts/EmployeesContext.tsx`):** Gestiona el estado global de la lista de empleados. Proporciona funciones para añadir, actualizar y eliminar empleados, con actualizaciones optimistas y re-fetch en caso de error.
    *   **`ShiftsProvider` (`src/contexts/ShiftsContext.tsx`):** Gestiona el estado global de los registros de tiempo (turnos). Proporciona funciones para actualizar y eliminar turnos, con re-fetch para asegurar la consistencia.
    *   `TooltipProvider`, `Toaster`, `Sonner`: Para elementos de UI como tooltips y notificaciones.
    *   `BrowserRouter`: Para la navegación entre rutas.
*   **`src/pages/Index.tsx` y `src/pages/NotFound.tsx`:** Páginas principales de la aplicación. `Index.tsx` probablemente contiene el `AppLayout`.
*   **`src/components/AppLayout.tsx`:** El componente principal que orquesta la vista general de la aplicación.
    *   Utiliza `useAuth()` para determinar si el usuario es administrador.
    *   Utiliza `useEmployees()` y `useShifts()` para acceder a los datos de empleados y turnos, y a las funciones de recarga (`reloadEmployees`, `reloadShifts`).
    *   Maneja la lógica compleja de registro de entrada/salida de empleados, incluyendo validaciones (turnos largos, salidas rápidas) y diálogos de confirmación/corrección manual.
    *   Renderiza condicionalmente `AdminPanel` (si es admin) o `EmployeeClockIn` y `WeeklyDashboard` (si no es admin).
*   **`src/components/AdminLogin.tsx`:** Componente de UI para el inicio de sesión del administrador. Utiliza `useAuth()` para interactuar con la lógica de autenticación.
*   **`src/components/EmployeeClockIn.tsx`:** Componente de UI para que los empleados registren su entrada y salida. Recibe `employees` y `onClockAction` como props.
*   **`src/components/AdminPanel.tsx`:** El panel de administración.
    *   Utiliza `useEmployees()` y `useShifts()` para obtener los datos y las funciones de manipulación.
    *   Renderiza `AddEmployeeForm`, `EmployeesTable` y `ShiftsTable`.
*   **`src/components/WeeklyDashboard.tsx`:** Muestra un resumen semanal de horas trabajadas.
    *   Utiliza el hook `useWeeklyDashboard()` para procesar los datos.
*   **`src/hooks/useWeeklyDashboard.ts`:** Un hook personalizado que calcula las horas semanales de los empleados y los turnos abiertos. Ahora obtiene los datos de `employees` y `logs` directamente de los contextos `EmployeesContext` y `ShiftsContext`.
*   **`src/services/api.ts`:** Contiene las funciones para interactuar con el backend de Google Apps Script (e.g., `fetchData`, `addLog`, `addEmployee`, `updateEmployee`, `deleteEmployee`, `updateShift`, `deleteLog`).
*   **`src/types/index.ts`:** Define las interfaces de datos (`Employee`, `TimeLog`, `ApiResponse`, etc.) utilizadas en toda la aplicación.

### 3. Flujo de Datos

1.  **Carga Inicial:** Al cargar la aplicación, `EmployeesProvider` y `ShiftsProvider` realizan llamadas iniciales a `apiService.fetchData()` para obtener la lista de empleados y todos los registros de tiempo. Estos datos se almacenan en el estado de sus respectivos contextos.
2.  **Acceso a Datos:** Los componentes como `AppLayout`, `AdminPanel` y `WeeklyDashboard` acceden a estos datos y a las funciones de manipulación a través de los hooks `useEmployees()` y `useShifts()`.
3.  **Modificaciones (CRUD):**
    *   Cuando un administrador añade, actualiza o elimina un empleado, las funciones (`addEmployee`, `updateEmployee`, `deleteEmployee`) del `EmployeesContext` son llamadas. Estas funciones realizan una **actualización optimista** en el estado local y luego llaman a la API. Si la API falla, el estado se revierte.
    *   Cuando se registra una entrada/salida o se corrige un turno, las funciones (`updateShift`, `deleteShift`) del `ShiftsContext` son llamadas. Estas funciones llaman a la API y, tras una respuesta exitosa, **recargan los datos** de los turnos para asegurar la consistencia.
    *   Las acciones de reloj de los empleados (`handleClockAction`, `handleManualClockInSubmit` en `AppLayout`) llaman directamente a `apiService.addLog` y luego activan `reloadShifts()` (y `reloadEmployees()` en el caso manual) para refrescar los datos en los contextos.

### 4. Lógica de Autenticación (Administrador)

*   El `AuthProvider` gestiona el estado `isAdmin`.
*   `AdminLogin.tsx` permite al administrador ingresar una contraseña.
*   La función `login` en `AuthContext` verifica la contraseña (actualmente `1111` o `VITE_ADMIN_PASSWORD`) y, si es correcta, establece `isAdmin` a `true` y guarda un indicador en `sessionStorage`.
*   La aplicación (`AppLayout`) renderiza el `AdminPanel` solo si `isAdmin` es `true`.
*   La función `logout` en `AuthContext` restablece `isAdmin` a `false` y limpia `sessionStorage`.

### 5. Lógica de Registro de Entrada/Salida (Empleados)

*   Gestionada principalmente en `AppLayout.tsx` y `EmployeeClockIn.tsx`.
*   `EmployeeClockIn` muestra la lista de empleados y botones de acción.
*   `AppLayout` contiene `handleClockAction` que:
    *   Determina si la acción es una entrada o salida.
    *   Realiza validaciones:
        *   Si un empleado intenta salir sin una entrada previa, se le ofrece una "entrada manual olvidada".
        *   Si un empleado intenta salir dos veces seguidas, se le advierte.
        *   Si un turno excede las 18 horas, se bloquea la salida y se requiere intervención del administrador.
        *   Si una entrada se realiza muy poco después de una salida, se muestra una advertencia de confirmación.
    *   Llama a `apiService.addLog` para registrar la acción.
    *   Activa `reloadShifts()` para actualizar los datos globales.
*   `handleManualClockInSubmit` permite al administrador registrar manualmente una entrada y salida para un empleado.

### 6. Lógica del Panel de Administración

*   Accesible solo para administradores (`isAdmin: true`).
*   Permite la gestión de empleados (añadir, editar, eliminar) a través de `EmployeesTable` y `AddEmployeeForm`, que interactúan con las funciones proporcionadas por `useEmployees()`.
*   Permite la gestión de turnos (editar, eliminar) a través de `ShiftsTable`, que interactúa con las funciones proporcionadas por `useShifts()`.

### 7. Lógica del Dashboard Semanal

*   El hook `useWeeklyDashboard.ts` calcula y presenta un resumen de las horas trabajadas por los empleados para una semana seleccionada.
*   Obtiene los datos de `employees` y `logs` directamente de los contextos `EmployeesContext` y `ShiftsContext`.
*   Permite navegar entre semanas (anterior/siguiente).
*   Calcula las horas trabajadas y también identifica los turnos que aún están abiertos.

---

En resumen, el sistema ha evolucionado hacia una arquitectura más limpia y modular, donde la gestión del estado global está claramente separada por dominios (autenticación, empleados, turnos) y la lógica de negocio se encapsula en hooks y contextos específicos, mejorando la mantenibilidad, el rendimiento y la escalabilidad.

---

### Estado Actual del Proyecto y Debugging (15 de Agosto de 2025)

**1. Refactorización del Estado Global:**
*   **Completada:** La refactorización del estado global de la aplicación ha sido finalizada.
    *   Se crearon `AuthContext.tsx`, `EmployeesContext.tsx` y `ShiftsContext.tsx`.
    *   `App.tsx` fue actualizado para usar los nuevos proveedores.
    *   `AdminLogin.tsx`, `AdminPanel.tsx`, `AppLayout.tsx` y `useWeeklyDashboard.ts` fueron refactorizados para consumir los nuevos contextos.
    *   Los archivos antiguos `src/contexts/AppContext.tsx` y `src/hooks/useAdminData.ts` fueron eliminados.

**2. Errores Encontrados y Solucionados Durante el Debugging:**
*   **`Failed to resolve import "@/contexts/AppContext" from "src/pages/Index.tsx"`:**
    *   **Causa:** `src/pages/Index.tsx` seguía intentando importar el `AppContext` antiguo que ya no existía.
    *   **Solución:** Se refactorizó `src/pages/Index.tsx` para eliminar la importación y el uso de `AppProvider`, ya que los proveedores ahora se manejan en `App.tsx`.
*   **`Uncaught SyntaxError: Identifier 'useState' has already been declared` en `useWeeklyDashboard.ts`:**
    *   **Causa:** Un error en una operación de `replace` anterior duplicó todo el contenido de `useWeeklyDashboard.ts`, incluyendo las importaciones de React hooks.
    *   **Solución:** Se sobrescribió `useWeeklyDashboard.ts` con la versión correcta y sin duplicados.
*   **`Uncaught ReferenceError: useEmployees is not defined` en `AppLayout.tsx`:**
    *   **Causa:** Se olvidó añadir las sentencias `import { useEmployees } from '@/contexts/EmployeesContext';` y `import { useShifts } from '@/contexts/ShiftsContext';` en `AppLayout.tsx` después de refactorizarlo para usar estos hooks.
    *   **Solución:** Se añadieron las importaciones faltantes en `AppLayout.tsx`.
*   **Aplicación "se queda procesando... por siempre" (Loading Overlay Persistente):**
    *   **Causa:** El estado `loading` local en `AppLayout.tsx` (`const [loading, setLoading] = useState(false);`) y su `useEffect` asociado (`setLoading(overallLoading);`) creaban un bucle auto-perpetuante que mantenía `overallLoading` siempre en `true`, incluso después de que los datos de los contextos se cargaran.
    *   **Solución:** Se eliminó el estado `loading` local y su `useEffect` de `AppLayout.tsx`. `overallLoading` ahora se calcula directamente como `loadingEmployees || loadingShifts`.

**3. Error Actual (Pendiente de Solución):**
*   **`Uncaught (in promise) ReferenceError: setLoading is not defined` al intentar registrar una entrada o salida de un empleado:**
    *   **Causa:** Después de eliminar el estado `loading` local de `AppLayout.tsx`, las funciones `handleClockAction`, `handleManualClockInSubmit` y `handleClockInWarningConfirm` todavía intentaban llamar a `setLoading(true)` y `setLoading(false)`.
    *   **Última Acción Tomada:** Se inició el proceso de eliminar todas las llamadas a `setLoading()` de `AppLayout.tsx`. Se completó la eliminación de `setLoading(true)` y `setLoading(false)` de `handleClockInWarningConfirm`. Se está en proceso de eliminar las llamadas restantes en `handleClockAction` y `handleManualClockInSubmit`.

**Próximos Pasos:**
*   Continuar eliminando todas las llamadas a `setLoading()` de `handleClockAction` y `handleManualClockInSubmit` en `AppLayout.tsx`.
*   Una vez completado, verificar el funcionamiento de la aplicación y los registros de la consola/red.
