Aquí tienes una propuesta de **README profesional y de alto nivel técnico** diseñada específicamente para la defensa de tu Challenge. Este documento no solo describe qué hace la app, sino que demuestra tu **seniority** al explicar el razonamiento detrás de cada decisión y cómo superaste los obstáculos críticos.

---

# 🚀 Nexus Ecommerce - Challenge Técnico Senior

Este proyecto es una plataforma de E-commerce de alto rendimiento construida bajo una **Arquitectura Orientada a Eventos (EDA)** y un modelo de microservicios desacoplados. La solución garantiza escalabilidad, integridad referencial y un procesamiento asíncrono eficiente para tareas críticas como la gestión de inventarios.

## 🔗 Enlaces de Producción
*   **Frontend (UI):** [https://challenge-tecnico-fullstack-nivel-senior-microservic-jh3lijtne.vercel.app/](https://challenge-tecnico-fullstack-nivel-senior-microservic-jh3lijtne.vercel.app/)
*   **Backend (API):** [https://challenge-tecnico-fullstack-nivel-senior.onrender.com/api/](https://challenge-tecnico-fullstack-nivel-senior.onrender.com/api/product)
*   **Health Check:** [Ver Lista de Productos](https://challenge-tecnico-fullstack-nivel-senior.onrender.com/api/product)

---

## 🏗️ Arquitectura y Decisiones Tecnológicas

### 1. El Corazón: Arquitectura Orientada a Eventos (EDA)
Se implementó **BullMQ sobre Redis** para manejar la creación de inventario. Cuando un producto es creado en el Catálogo (PostgreSQL), se emite un evento asíncrono. Un Worker independiente captura este evento e inicializa el stock. 
*   **¿Por qué?** Para evitar bloqueos en el hilo principal y asegurar que el sistema de inventario pueda escalar o fallar sin afectar la disponibilidad del catálogo de productos.

### 2. Stack de Infraestructura Cloud-Native
*   **Backend (NestJS v10):** Elegido por su sólido soporte para TypeScript y su modularidad.
*   **Frontend (React 18 + Vite):** Utilizado para una experiencia de usuario fluida y tiempos de construcción (Build) optimizados.
*   **Persistencia (Supabase/PostgreSQL):** Base de datos relacional de alta disponibilidad con Transaction Pooling (puerto 6543) para gestionar eficientemente las conexiones en la nube.
*   **Mensajería (Upstash/Redis):** Broker de mensajes serverless con soporte TLS nativo para seguridad en tránsito.
*   **Despliegue Híbrido (Vercel + Render):** Estrategia multi-cloud para aprovechar el Edge Network de Vercel en la UI y la persistencia de procesos Docker en Render para los Workers del backend.

---

## 🧠 Retos Técnicos y Soluciones (The Senior Journey)

Durante el ciclo de desarrollo y despliegue, se resolvieron desafíos críticos que demuestran la capacidad de diagnóstico:

1.  **Desafío: Inconsistencia de Configuración en el Build Agent**
    *   *Problema:* El agente de Vercel fallaba al localizar binarios de construcción (Error 127).
    *   *Solución:* Se normalizó la estructura del monorepo redefiniendo el **Root Directory** y utilizando `npx` para asegurar la localización de dependencias en subdirectorios aislados.

2.  **Desafío: Integridad Referencial Asíncrona**
    *   *Problema:* El sistema de inventario fallaba porque no encontraba una "Variación" (Talla/Color) asociada al nuevo producto.
    *   *Solución:* Se refactorizó el servicio de productos para crear automáticamente una **ProductVariation** base en una transacción atómica, proporcionando un ancla válida para el Worker de BullMQ.

3.  **Desafío: Sanitización de Secretos y DNS**
    *   *Problema:* Errores de conexión (`ENOTFOUND`) debido a caracteres de escape invisibles (`\n`) y símbolos especiales en las contraseñas de la DB.
    *   *Solución:* Se implementó un saneamiento riguroso de variables de entorno y se migró a una configuración desglosada (Host, User, Pass) para evitar errores de parseo en URLs complejas.

4.  **Desafío: Normalización de la Capa de Transporte**
    *   *Problema:* Doble anidación de datos debido al uso de Interceptors globales en NestJS.
    *   *Solución:* Se implementó una lógica de extracción segura en el frontend con validación de tipos, asegurando la resiliencia de la UI ante cambios en el esquema de respuesta.

---

## 📖 Documentación de la API (Endpoints)

| Módulo | Acción | Endpoint | Método | Seguridad |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | Login de Usuario | `/api/auth/login` | `POST` | Pública |
| **Auth** | Registro | `/api/auth/register` | `POST` | Pública |
| **Product** | Listar Catálogo | `/api/product` | `GET` | Pública |
| **Product** | Crear Producto | `/api/product/create` | `POST` | Admin/Merchant (JWT) |
| **Inventory** | Stock Global | `/api/inventory` | `GET` | Pública |
| **Inventory** | Stock por Producto| `/api/inventory/product/:id`| `GET` | Pública |
| **User** | Mi Perfil | `/api/user/profile` | `GET` | Bearer Token |

---

## 🛠️ Instalación y Desarrollo Local

```bash
# 1. Levantar Infraestructura (Postgres + Redis)
docker-compose up -d

# 2. Iniciar Backend
cd backend
npm install
npm run migration:run
npm run seed:run
npm run start:dev

# 3. Iniciar Frontend
cd ../frontend
npm install
npm run dev
```

---

## 💡 Defensa Técnica Final
> "Este proyecto no es solo una implementación funcional de los requerimientos; es una demostración de buenas prácticas arquitectónicas. He aplicado el principio de **Fail Fast** mediante validación estricta con Joi, garantizado la **Paridad de Entornos** mediante Dockerización, y asegurado la **Consistencia Eventual** del sistema ante cargas variables. La solución es resiliente, tipada de extremo a extremo y lista para producción."

---
*Desarrollado por Fabio Arias - 2026*