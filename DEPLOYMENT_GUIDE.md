# Guía de Despliegue e Instalación

## Introducción

Este documento proporciona las instrucciones paso a paso para configurar el entorno de desarrollo local y para desplegar la aplicación completa (Frontend, Backend, Base de Datos) en un entorno de producción.

Este archivo se irá detallando a medida que construyamos y despleguemos cada componente del sistema.

---

## 1. Configuración del Entorno de Desarrollo Local

### Prerrequisitos

* Node.js (versión recomendada: 20.x o superior)
* `pnpm` (o el gestor de paquetes de tu elección)
* Git
* Docker (para levantar una base de datos PostgreSQL localmente)

### Pasos de Instalación

*(Se detallarán los pasos para clonar el repositorio, instalar dependencias y levantar los servicios de frontend y backend localmente)*

1.  Clonar el repositorio: `git clone ...`
2.  ...

### Variables de Entorno (.env)

*(Se listarán las variables de entorno necesarias para correr el proyecto en local, como `DATABASE_URL`, etc.)*

---

## 2. Despliegue en Producción

### Componente: Base de Datos (PostgreSQL)

* **Servicio:** Render / Railway / Neon
* **Pasos:**
    1.  *(Se detallará cómo crear la base de datos en el proveedor elegido)*
    2.  ...

### Componente: Backend (Node.js API)

* **Servicio:** Render / Railway
* **Pasos:**
    1.  *(Se detallará cómo conectar el repositorio y desplegar el servicio)*
    2.  *(Se explicará cómo configurar las variables de entorno de producción, como `DATABASE_URL` y `JWT_SECRET`)*
    3.  ...

### Componente: Frontend (React App)

* **Servicio:** Vercel
* **Pasos:**
    1.  *(Se detallará cómo conectar el repositorio y desplegar el sitio)*
    2.  *(Se explicará cómo configurar la variable de entorno `VITE_API_URL` para que apunte a la URL del backend en producción)*
    3.  ...
