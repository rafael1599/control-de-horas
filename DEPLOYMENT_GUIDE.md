# Guía de Despliegue e Instalación

## Introducción

Este documento proporciona las instrucciones paso a paso para configurar el entorno de desarrollo local y para desplegar la aplicación completa (Frontend, Backend, Base de Datos) en un entorno de producción.

Este archivo se irá detallando a medida que construyamos y despleguemos cada componente del sistema.

---

## 1. Configuración del Entorno de Desarrollo Local

### Prerrequisitos

*   **Node.js:** Versión 20.x o superior.
*   **pnpm:** Un gestor de paquetes rápido y eficiente. Si no lo tienes, instálalo globalmente: `npm install -g pnpm`.
*   **Git:** Para clonar el repositorio.
*   **Docker:** Para levantar una base de datos PostgreSQL localmente. Asegúrate de que Docker Desktop o el servicio Docker esté corriendo.

### Pasos de Instalación

1.  **Clonar el Repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/control-de-horas.git
    cd control-de-horas
    ```

2.  **Configurar Variables de Entorno Locales:**
    Crea un archivo `.env` en la raíz del proyecto (`/control-de-horas/.env`) y otro en el directorio `backend` (`/control-de-horas/backend/.env`).

    **Contenido de `/control-de-horas/.env` (para el Frontend):**
    ```
    VITE_API_BASE_URL=http://localhost:3001/api/v1
    VITE_ADMIN_PASSWORD=1111 # Contraseña de administrador para desarrollo local
    ```

    **Contenido de `/control-de-horas/backend/.env` (para el Backend):**
    ```
    DATABASE_URL="postgresql://user:password@localhost:5432/control_de_horas_db?schema=public"
    JWT_SECRET="tu_secreto_jwt_seguro_y_largo" # Cambiar en producción
    COMPANY_ID="tu_company_id_de_ejemplo" # Usar un UUID válido para pruebas, ej. "a1b2c3d4-e5f6-7890-1234-567890abcdef"
    ```
    *Asegúrate de reemplazar `user`, `password`, `control_de_horas_db`, `tu_secreto_jwt_seguro_y_largo` y `tu_company_id_de_ejemplo` con valores adecuados para tu entorno de desarrollo.*

3.  **Levantar la Base de Datos PostgreSQL con Docker:**
    Asegúrate de que Docker esté corriendo. Puedes usar un comando como el siguiente para iniciar una instancia de PostgreSQL:
    ```bash
    docker run --name some-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
    ```
    Esto creará un contenedor PostgreSQL accesible en `localhost:5432` con usuario `postgres` y contraseña `password`. Ajusta la `DATABASE_URL` en tu `.env` del backend si usas credenciales diferentes.

4.  **Instalar Dependencias:**
    Desde la raíz del proyecto (`/control-de-horas`):
    ```bash
    pnpm install
    cd backend
    pnpm install
    cd ..
    ```

5.  **Ejecutar Migraciones de Prisma (Backend):**
    Desde el directorio `backend` (`/control-de-horas/backend`):
    ```bash
    pnpm prisma migrate dev --name initial_setup
    ```
    Esto aplicará las migraciones de la base de datos definidas en `prisma/schema.prisma`.

6.  **Iniciar el Backend:**
    Desde el directorio `backend` (`/control-de-horas/backend`):
    ```bash
    pnpm dev
    ```
    El backend se iniciará en `http://localhost:3001`.

7.  **Iniciar el Frontend:**
    Desde la raíz del proyecto (`/control-de-horas`):
    ```bash
    pnpm dev
    ```
    El frontend se iniciará en `http://localhost:5173` (o un puerto similar).

---

## 2. Despliegue en Producción

### Variables de Entorno Comunes para Producción

Las siguientes variables de entorno deben configurarse en los servicios de despliegue correspondientes:

*   **Backend:**
    *   `DATABASE_URL`: URL de conexión a la base de datos PostgreSQL en producción.
    *   `JWT_SECRET`: Una cadena secreta muy larga y compleja para la firma de tokens JWT. **¡Genera una nueva y segura para producción!**
    *   `COMPANY_ID`: El ID de la compañía principal para la cual la aplicación está siendo desplegada.

*   **Frontend:**
    *   `VITE_API_BASE_URL`: La URL pública de tu backend desplegado (ej. `https://tu-backend.render.com/api/v1`).
    *   `VITE_ADMIN_PASSWORD`: La contraseña de administrador para el entorno de producción. **¡Usa una contraseña fuerte y segura!**

### Componente: Base de Datos (PostgreSQL)

*   **Servicio Recomendado:** Render, Railway, o Neon.
*   **Pasos:**
    1.  **Crear una nueva base de datos PostgreSQL** en el proveedor de tu elección (ej. Render.com, Railway.app, Neon.tech).
    2.  **Obtener la `DATABASE_URL`:** Una vez creada, el proveedor te proporcionará una cadena de conexión (URL) que deberás usar como valor para la variable de entorno `DATABASE_URL` en tu servicio de backend.
    3.  **Aplicar Migraciones:** Después de desplegar el backend, asegúrate de que las migraciones de Prisma se ejecuten automáticamente o manualmente en el entorno de producción para configurar el esquema de la base de datos.

### Componente: Backend (Node.js API)

*   **Servicio Recomendado:** Render o Railway.
*   **Pasos (Ejemplo con Render):**
    1.  **Crear un nuevo servicio web** en Render.com.
    2.  **Conectar tu repositorio de Git:** Selecciona el repositorio donde se encuentra tu código backend (el subdirectorio `backend`).
    3.  **Configurar el Build Command:** `pnpm install && pnpm prisma generate`
    4.  **Configurar el Start Command:** `pnpm start` (asegúrate de que tu `package.json` en `backend` tenga un script `start` que ejecute tu `server.ts` compilado, ej. `node dist/server.js`).
    5.  **Añadir Variables de Entorno:** En la sección de "Environment Variables" de tu servicio en Render, añade:
        *   `DATABASE_URL`: Pega la URL de conexión de tu base de datos PostgreSQL de producción.
        *   `JWT_SECRET`: Genera y pega una cadena secreta fuerte.
        *   `COMPANY_ID`: Pega el ID de la compañía para producción.
    6.  **Desplegar:** Render detectará automáticamente los cambios en tu rama principal y desplegará el servicio. Anota la URL pública que Render te asigne, ya que la necesitarás para el frontend.

---
### 2.5. Paso Crítico Post-Despliegue: Sembrar la Base de Datos

Después del primer despliegue exitoso del backend, la base de datos de producción tendrá las tablas creadas (`User`, `Company`, etc.), pero estarán vacías. La aplicación requiere que exista al menos un registro de `Company` para poder crear nuevos usuarios y empleados.

Para solucionar esto, hemos creado un endpoint temporal que se debe llamar **una sola vez** para inicializar la compañía principal.

**Acción:**
Con el backend ya desplegado, abre una terminal y ejecuta el siguiente comando `curl`:
```bash
curl -X POST https://control-de-horas-backend.onrender.com/api/v1/setup/initialize
```

**Resultado Esperado:**
Deberías recibir una respuesta JSON confirmando que la compañía fue creada exitosamente, similar a esta:
```json
{"message":"Compañía inicializada exitosamente.","company":{"id":"...","company_name":"Compañía Principal", ...}}
```
Una vez que recibas esta respuesta, la base de datos estará lista y la aplicación funcionará correctamente.

**Nota de Seguridad:** Este endpoint de `/setup` es temporal y debería ser eliminado en un futuro commit para no dejar expuesta una ruta de configuración.
---

### Componente: Frontend (React App)

*   **Servicio Recomendado:** Vercel.
*   **Pasos:**
    1.  **Crear un nuevo proyecto** en Vercel.com.
    2.  **Conectar tu repositorio de Git:** Selecciona el repositorio raíz de tu proyecto.
    3.  **Configurar el Root Directory:** Asegúrate de que Vercel detecte la raíz de tu proyecto React (normalmente el directorio principal).
    4.  **Configurar Variables de Entorno:** En la sección de "Environment Variables" de tu proyecto en Vercel, añade:
        *   `VITE_API_BASE_URL`: Pega la URL pública de tu backend desplegado (ej. `https://tu-backend.render.com/api/v1`).
        *   `VITE_ADMIN_PASSWORD`: Pega la contraseña de administrador para producción.
    5.  **Desplegar:** Vercel detectará automáticamente los cambios en tu rama principal y desplegará el frontend.