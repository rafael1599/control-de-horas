# Registro de Decisiones Arquitectónicas (ADR)

## Introducción

Este documento registra las decisiones técnicas y arquitectónicas importantes que se toman a lo largo del desarrollo del proyecto. Su propósito es tener un historial del "porqué" detrás de nuestras elecciones, para referencia futura y para mantener la coherencia.

Cada entrada registrará el contexto de la decisión, la decisión en sí misma y sus consecuencias.

---

### ADR-001: Migración de Backend desde Google Apps Script a Node.js/PostgreSQL

*   **Fecha:** 2025-09-06
*   **Contexto:** El sistema actual utiliza Google Apps Script como backend y Google Sheets como base de datos. Si bien es funcional para un prototipo, presenta limitaciones de escalabilidad, rendimiento y capacidades de consulta para un un producto SaaS multi-tenant. Se necesita una solución más robusta para soportar el crecimiento futuro, la gestión de múltiples compañías y funcionalidades complejas.
*   **Decisión:** Se decide migrar la totalidad del backend a un stack compuesto por **Node.js con Express y TypeScript**, un ORM **Prisma**, y una base de datos **PostgreSQL**.
*   **Consecuencias:**
    *   **Positivas:** Se obtiene una arquitectura escalable, un control total sobre la base de datos, un rendimiento superior y la capacidad de implementar un modelo multi-tenant seguro. El uso de TypeScript y Prisma proporcionará seguridad de tipos de extremo a extremo.
    *   **Negativas:** Requiere un esfuerzo de desarrollo inicial significativo para re-implementar toda la lógica de la API existente. Aumenta la complejidad del despliegue al tener que gestionar un servicio de backend y una base de datos separados.

---

### ADR-002: Adopción de React Context para la Gestión de Estado Global en el Frontend

*   **Fecha:** 2025-09-08
*   **Contexto:** La aplicación frontend, construida con React, necesita una forma eficiente de gestionar y compartir el estado global (como la información de autenticación del administrador, la lista de empleados y los registros de turnos) entre múltiples componentes sin recurrir al "prop drilling" (pasar props manualmente a través de muchos niveles de componentes).
*   **Decisión:** Se decide utilizar la **React Context API** nativa para la gestión del estado global. Se crearán contextos separados (`AuthContext`, `EmployeesContext`, `ShiftsContext`) para cada dominio de datos principal, encapsulando la lógica de negocio y proporcionando hooks personalizados (`useAuth`, `useEmployees`, `useShifts`) para un acceso sencillo al estado y las funciones relacionadas.
*   **Consecuencias:**
    *   **Positivas:**
        *   **Simplicidad y Nativismo:** No introduce dependencias de librerías de terceros, lo que reduce el tamaño del bundle y la complejidad del proyecto.
        *   **Integración Perfecta:** Se integra de forma natural con el ecosistema de React.
        *   **Claridad de Dominio:** Permite organizar el estado global en dominios lógicos y bien definidos.
        *   **Facilidad de Uso:** Los hooks personalizados simplifican el consumo del estado en los componentes.
    *   **Negativas:**
        *   **Rendimiento Potencial:** Un uso inadecuado o excesivo de Context puede llevar a re-renders innecesarios en componentes que no necesitan el estado actualizado, aunque esto se puede mitigar con `React.memo` y `useCallback`/`useMemo`.
        *   **Escalabilidad Limitada:** Para aplicaciones con un estado global extremadamente complejo o con necesidades avanzadas de depuración y trazabilidad, librerías dedicadas como Redux o Zustand podrían ofrecer más herramientas. Sin embargo, para el alcance actual del proyecto, Context es suficiente.

---

### ADR-003: Elección de Shadcn/ui y Tailwind CSS para el Diseño y Estilo del Frontend

*   **Fecha:** 2025-09-08
*   **Contexto:** Se requiere una solución de diseño y estilo para el frontend de React que permita construir una interfaz de usuario moderna, accesible y altamente personalizable, manteniendo al mismo tiempo un rendimiento óptimo y un tamaño de bundle reducido. La necesidad es tener componentes UI pre-construidos pero con total control sobre su apariencia y comportamiento.
*   **Decisión:** Se decide utilizar **Shadcn/ui** como base para los componentes de la interfaz de usuario y **Tailwind CSS** como framework de utilidad-first para el estilado. Shadcn/ui proporciona componentes "headless" que se pueden copiar y pegar directamente en el proyecto, permitiendo una personalización completa con clases de Tailwind.
*   **Consecuencias:**
    *   **Positivas:**
        *   **Personalización Extrema:** Al ser componentes que se "copian y pegan", se tiene control total sobre el código fuente y el estilado con Tailwind, permitiendo adaptar la UI a cualquier necesidad de diseño.
        *   **Rendimiento y Tamaño:** Tailwind CSS genera solo el CSS que se utiliza, resultando en un bundle final muy pequeño.
        *   **Desarrollo Rápido:** La combinación de componentes listos para usar y clases de utilidad acelera el proceso de desarrollo de la UI.
        *   **Accesibilidad:** Los componentes de Shadcn/ui están construidos con la accesibilidad en mente.
        *   **Consistencia:** Fomenta un diseño consistente al utilizar un sistema de diseño basado en tokens de Tailwind.
    *   **Negativas:**
        *   **Curva de Aprendizaje Inicial:** Tailwind CSS puede tener una curva de aprendizaje para desarrolladores no familiarizados con el enfoque de utilidad-first.
        *   **Mantenimiento de Componentes:** Al copiar el código de los componentes, las actualizaciones de Shadcn/ui requieren un proceso manual de sincronización si se desea incorporar nuevas características o correcciones.
        *   **HTML Verboso:** El uso extensivo de clases de utilidad en el HTML puede hacer que el marcado sea más verboso.

---

### ADR-004: Selección de Plataformas de Despliegue (Vercel para Frontend, Render/Railway para Backend)

*   **Fecha:** 2025-09-08
*   **Contexto:** Se necesita una infraestructura de despliegue robusta, escalable y fácil de gestionar para la aplicación completa (frontend, backend y base de datos). El objetivo es minimizar la sobrecarga operativa y permitir despliegues continuos y automatizados.
*   **Decisión:** Se decide utilizar **Vercel** para el despliegue del frontend (React App) y **Render o Railway** para el despliegue del backend (Node.js API) y la base de datos (PostgreSQL).
*   **Consecuencias:**
    *   **Positivas:**
        *   **Despliegues Automatizados:** Integración directa con Git para CI/CD, permitiendo despliegues automáticos en cada push.
        *   **Facilidad de Uso:** Plataformas amigables para desarrolladores con configuraciones sencillas.
        *   **Escalabilidad:** Capacidad de escalar automáticamente según la demanda para el frontend y el backend.
        *   **Rendimiento Global:** Vercel ofrece una CDN global para el frontend, mejorando la velocidad de carga para los usuarios.
        *   **Servicios Gestionados:** Render y Railway proporcionan bases de datos PostgreSQL gestionadas, reduciendo la carga de administración.
    *   **Negativas:**
        *   **Dependencia de Proveedores:** Se crea una dependencia de servicios de terceros, lo que podría implicar un "vendor lock-in" y posibles cambios en los precios o servicios.
        *   **Costos:** Aunque ofrecen planes gratuitos o de bajo costo para empezar, los costos pueden aumentar significativamente a medida que la aplicación escala.
        *   **Control Limitado:** Menos control sobre la infraestructura subyacente en comparación con soluciones de IaaS (Infrastructure as a Service).