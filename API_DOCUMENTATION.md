# Documentación de la API - Sistema de Control Horario

**Versión de API:** 1.0
**Estado:** En Desarrollo

## Introducción

Este documento describe la API RESTful para el Sistema de Control Horario. Se irá actualizando de forma incremental a medida que las funcionalidades se migren desde el backend de Google Apps Script al nuevo backend de Node.js.

La documentación para cada endpoint se añadirá únicamente después de que haya sido implementado y probado con éxito.

## Autenticación

*(Se detallará cuando se implemente el sistema de autenticación con JWT)*

## Módulos

*(Los módulos como `/auth`, `/employees`, `/time-entries`, etc., se añadirán aquí a medida que se construyan)*

---

## Módulo: Empleados (`/employees`)

Gestión CRUD de los empleados de una compañía.

*   **Autenticación Requerida:** Sí (eventualmente, por ahora las rutas son públicas).
*   **Prefijo de Ruta:** `/api/v1/employees`

### 1. Obtener todos los empleados de una Compañía

*   **Endpoint:** `GET /by-company/:companyId`
*   **Descripción:** Devuelve una lista de todos los empleados de la compañía especificada.
*   **Parámetros de URL:**
    *   `companyId` (string, obligatorio): El ID de la compañía.
*   **Respuesta Exitosa (200 OK):**
    ```json
    [
      {
        "id": "uuid-del-empleado",
        "full_name": "Nombre Empleado",
        "hourly_rate": 15.5,
        "createdAt": "...",
        "updatedAt": "...",
        "companyId": "uuid-de-la-compañia",
        "userId": "uuid-del-usuario"
      }
    ]
    ```

### 2. Crear un nuevo empleado

*   **Endpoint:** `POST /`
*   **Descripción:** Crea un nuevo perfil de empleado y el usuario asociado.
*   **Cuerpo de la Solicitud (Request Body):**
    ```json
    {
      "full_name": "Ana López",
      "email": "ana.lopez@miempresa.com",
      "password": "password_inicial_para_ana",
      "hourly_rate": 18.50,
      "companyId": "uuid-de-la-compañia"
    }
    ```
*   **Respuesta Exitosa (201 Created):** Devuelve el objeto del empleado recién creado.

### 3. Actualizar un empleado

*   **Endpoint:** `PUT /:id`
*   **Descripción:** Actualiza los detalles de un empleado específico.
*   **Parámetros de URL:**
    *   `id` (string, obligatorio): El ID del empleado a actualizar.
*   **Cuerpo de la Solicitud (Request Body):**
    ```json
    {
      "full_name": "Nuevo Nombre",
      "hourly_rate": 20.00
    }
    ```
*   **Respuesta Exitosa (200 OK):** Devuelve el objeto del empleado actualizado.

### 4. Eliminar un empleado

*   **Endpoint:** `DELETE /:id`
*   **Descripción:** Elimina a un empleado y su usuario asociado.
*   **Parámetros de URL:**
    *   `id` (string, obligatorio): El ID del empleado a eliminar.
*   **Respuesta Exitosa (204 No Content):** No devuelve contenido.

---

## Módulo: Fichajes (`/time-entries`)

Gestión de los registros de entrada y salida de los empleados (fichajes).

*   **Autenticación Requerida:** Sí (eventualmente, por ahora las rutas son públicas).
*   **Prefijo de Ruta:** `/api/v1/time-entries`

### 1. Obtener todos los fichajes de una Compañía

*   **Endpoint:** `GET /by-company/:companyId`
*   **Descripción:** Devuelve una lista de todos los registros de tiempo (fichajes) de la compañía especificada. Incluye tanto entradas como salidas.
*   **Parámetros de URL:**
    *   `companyId` (string, obligatorio): El ID de la compañía.
*   **Respuesta Exitosa (200 OK):**
    ```json
    [
      {
        "id": "uuid-del-fichaje",
        "employee_id": "uuid-del-empleado",
        "companyId": "uuid-de-la-compañia",
        "start_time": "2025-09-08T08:00:00.000Z",
        "end_time": "2025-09-08T17:00:00.000Z",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
    ```

### 2. Registrar Entrada/Salida (Fichaje Automático)

*   **Endpoint:** `POST /clock`
*   **Descripción:** Registra una acción de entrada o salida para un empleado. Si el empleado no tiene un turno abierto, se registra una entrada. Si tiene un turno abierto, se registra la salida.
*   **Cuerpo de la Solicitud (Request Body):**
    ```json
    {
      "employee_id": "uuid-del-empleado",
      "companyId": "uuid-de-la-compañia"
    }
    ```
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "message": "Entrada registrada exitosamente.",
      "time_entry": {
        "id": "uuid-del-fichaje",
        "employee_id": "uuid-del-empleado",
        "companyId": "uuid-de-la-compañia",
        "start_time": "2025-09-08T08:00:00.000Z",
        "end_time": null,
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
    ```
    O para una salida:
    ```json
    {
      "message": "Salida registrada exitosamente.",
      "time_entry": {
        "id": "uuid-del-fichaje",
        "employee_id": "uuid-del-empleado",
        "companyId": "uuid-de-la-compañia",
        "start_time": "2025-09-08T08:00:00.000Z",
        "end_time": "2025-09-08T17:00:00.000Z",
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
    ```

### 3. Crear un Fichaje Manual

*   **Endpoint:** `POST /manual`
*   **Descripción:** Permite a un administrador crear un registro de tiempo completo (entrada y salida) manualmente para un empleado.
*   **Cuerpo de la Solicitud (Request Body):**
    ```json
    {
      "employee_id": "uuid-del-empleado",
      "companyId": "uuid-de-la-compañia",
      "start_time": "2025-09-08T08:00:00.000Z",
      "end_time": "2025-09-08T17:00:00.000Z"
    }
    ```
*   **Respuesta Exitosa (201 Created):**
    ```json
    {
      "id": "uuid-del-fichaje-manual",
      "employee_id": "uuid-del-empleado",
      "companyId": "uuid-de-la-compañia",
      "start_time": "2025-09-08T08:00:00.000Z",
      "end_time": "2025-09-08T17:00:00.000Z",
      "createdAt": "...",
      "updatedAt": "..."
    }
    ```

### 4. Actualizar un Fichaje Existente (Corrección Manual)

*   **Endpoint:** `PUT /:id`
*   **Descripción:** Permite a un administrador corregir las horas de entrada o salida de un registro de tiempo existente.
*   **Parámetros de URL:**
    *   `id` (string, obligatorio): El ID del fichaje a actualizar.
*   **Cuerpo de la Solicitud (Request Body):**
    ```json
    {
      "start_time": "2025-09-08T08:15:00.000Z",
      "end_time": "2025-09-08T17:30:00.000Z"
    }
    ```
    (Los campos `start_time` y `end_time` son opcionales, se pueden enviar uno, otro o ambos).
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "id": "uuid-del-fichaje",
      "employee_id": "uuid-del-empleado",
      "companyId": "uuid-de-la-compañia",
      "start_time": "2025-09-08T08:15:00.000Z",
      "end_time": "2025-09-08T17:30:00.000Z",
      "createdAt": "...",
      "updatedAt": "..."
    }
    ```

### 5. Eliminar un Fichaje

*   **Endpoint:** `DELETE /:id`
*   **Descripción:** Elimina un registro de tiempo específico del sistema.
*   **Parámetros de URL:**
    *   `id` (string, obligatorio): El ID del fichaje a eliminar.
*   **Respuesta Exitosa (204 No Content):** No devuelve contenido.
