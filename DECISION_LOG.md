# Registro de Decisiones Arquitectónicas (ADR)

## Introducción

Este documento registra las decisiones técnicas y arquitectónicas importantes que se toman a lo largo del desarrollo del proyecto. Su propósito es tener un historial del "porqué" detrás de nuestras elecciones, para referencia futura y para mantener la coherencia.

Cada entrada registrará el contexto de la decisión, la decisión en sí misma y sus consecuencias.

---

### ADR-001: Migración de Backend desde Google Apps Script a Node.js/PostgreSQL

* **Fecha:** 2025-09-06
* **Contexto:** El sistema actual utiliza Google Apps Script como backend y Google Sheets como base de datos. Si bien es funcional para un prototipo, presenta limitaciones de escalabilidad, rendimiento y capacidades de consulta para un producto SaaS multi-tenant. Se necesita una solución más robusta para soportar el crecimiento futuro, la gestión de múltiples compañías y funcionalidades complejas.
* **Decisión:** Se decide migrar la totalidad del backend a un stack compuesto por **Node.js con Express y TypeScript**, un ORM **Prisma**, y una base de datos **PostgreSQL**.
* **Consecuencias:**
    * **Positivas:** Se obtiene una arquitectura escalable, un control total sobre la base de datos, un rendimiento superior y la capacidad de implementar un modelo multi-tenant seguro. El uso de TypeScript y Prisma proporcionará seguridad de tipos de extremo a extremo.
    * **Negativas:** Requiere un esfuerzo de desarrollo inicial significativo para re-implementar toda la lógica de la API existente. Aumenta la complejidad del despliegue al tener que gestionar un servicio de backend y una base de datos separados.

*(Nuevas decisiones arquitectónicas se registrarán aquí)*
