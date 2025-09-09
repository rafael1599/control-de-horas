# Historias de Usuario

## Módulo: Fichaje de Empleados

*   **US-001:** Como empleado, quiero poder fichar mi entrada y salida para registrar mis horas de trabajo.
*   **US-002:** Como empleado, quiero ver mi estado actual (fichado/no fichado) para saber si mi registro fue exitoso.
*   **US-003:** Como empleado, quiero seleccionar mi nombre de una lista para fichar mi entrada o salida.

## Módulo: Autenticación y Acceso de Administrador

*   **US-006:** Como administrador, quiero iniciar sesión con una contraseña para acceder al panel de administración.
*   **US-007:** Como administrador, quiero que el sistema me informe si mi intento de inicio de sesión fue incorrecto para poder corregirlo.
*   **US-008:** Como administrador, quiero cerrar mi sesión para proteger el acceso al panel de administración.

## Módulo: Gestión de Empleados

*   **US-004:** Como administrador, quiero añadir nuevos empleados al sistema para que puedan registrar sus horas.
*   **US-005:** Como administrador, quiero ver una lista de todos los empleados registrados para tener una visión general.
*   **US-009:** Como administrador, quiero poder actualizar la información de un empleado existente (ej. nombre, tarifa por hora) para mantener los datos precisos.
*   **US-010:** Como administrador, quiero poder eliminar empleados del sistema para gestionar la plantilla.

## Módulo: Reportes y Visualización de Horas

*   **US-011:** Como administrador, quiero ver un resumen semanal de las horas trabajadas por cada empleado para monitorear la productividad.
*   **US-012:** Como administrador, quiero ver el pago estimado semanal por empleado basado en sus horas y tarifa para la gestión de nóminas.
*   **US-0013:** Como administrador, quiero ver los turnos activos en tiempo real para saber quién está actualmente fichado.
*   **US-0014:** Como administrador, quiero navegar entre diferentes semanas en el resumen de horas para revisar historiales de trabajo.

## Módulo: Gestión y Corrección de Registros de Tiempo

*   **US-015:** Como administrador, quiero ver una tabla con todos los registros de entrada y salida de los empleados para una auditoría detallada.
*   **US-016:** Como administrador, quiero poder corregir manualmente un registro de tiempo (ej. ajustar hora de entrada/salida) para rectificar errores.
*   **US-017:** Como administrador, quiero poder añadir un registro de tiempo manual (ej. para un empleado que olvidó fichar) para asegurar la precisión de los datos.
*   **US-018:** Como administrador, quiero poder eliminar un registro de tiempo existente para corregir entradas erróneas.

## Módulo: Validaciones de Fichaje

*   **US-019:** Como sistema, quiero prevenir que un empleado registre una nueva entrada si ya tiene un turno abierto para evitar duplicidades.
*   **US-020:** Como sistema, quiero advertir al empleado si intenta fichar entrada muy poco tiempo después de una salida para evitar errores de re-entrada rápida.
*   **US-021:** Como sistema, quiero advertir al empleado si intenta fichar salida muy poco tiempo después de una entrada para evitar errores de salida rápida.
*   **US-022:** Como sistema, quiero detectar y permitir la corrección manual de turnos anómalos (ej. salida sin entrada previa, turno excesivamente largo) para mantener la integridad de los datos.