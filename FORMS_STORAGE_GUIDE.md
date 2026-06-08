# Guía de Almacenamiento y Notificaciones de Formularios

Este documento define la estrategia para capturar, almacenar y enviar los formularios de la plataforma Colmedikal.

## 1. Captura de Formularios

Todos los formularios en la aplicación frontend (p.ej.: Contacto, Cotizador, Agendamiento, Emisión de Póliza) envían sus datos a un endpoint centralizado en el servidor backend:

- **Endpoint:** `POST /api/forms/submit`

## 2. Almacenamiento y Notificación

Una vez que el servidor recibe una petición, procede con los siguientes pasos:

### Opción A: Base de Datos Relacional o NoSQL (Recomendado)
- **Tecnología:** PostgreSQL (vía Prisma/Drizzle) o Firebase Firestore.
- **Flujo:** 
  1. Validar `req.body`
  2. Insertar el registro en la tabla/colección `Solicitudes`
  3. Retornar 200 OK al cliente

### Opción B: Integración con CRM (Kommo)
- **Archivos:** `src/integrations/kommo-webhook.ts`, `src/integrations/form-handler.ts`
- **Flujo:**
  1. Recibir datos del cliente local.
  2. Hacer forward de los datos usando `fetch()` apuntando hacia los webhooks de Kommo.

## 3. Acceso Administrativo (Dashboard)

El sistema viene equipado con un portal de administración ligero servido desde:
- **Acceso:** `/dashboard.html`

### Autenticación Simple
- Un usuario accede con la contraseña definida en `process.env.DASHBOARD_PASSWORD`.
- El servidor autentica al cliente y le provee un token JWT o simple para leer la ruta protegida `GET /api/forms`.

## 4. Estructura de Datos
```typescript
interface FormData {
  type: string; // 'contacto', 'cotizador', 'tramite', etc.
  data: Record<string, any>; // Campos dinámicos del formulario
  createdAt?: string;
}
```
