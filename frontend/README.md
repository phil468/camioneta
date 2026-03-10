# Frontend - Control de Alquiler de Jabas y Parihuelas

Aplicación móvil/web construida con Ionic 7 + Angular 20 para gestionar el alquiler de jabas y parihuelas.

## 🚀 Iniciar Aplicación

### Web (Desarrollo)

```bash
ionic serve
```

Abre automáticamente en: `http://localhost:8100`

### Móvil (Android)

```bash
ionic capacitor run android
```

### Móvil (iOS)

```bash
ionic capacitor run ios
```

## 📱 Páginas Implementadas

### ✅ Home Page (`/`)

- Tarjetas de navegación:
  - Nuevo Registro → `/registro-form`
  - Lista de Registros → `/registro-lista`
  - Reportes (próximamente)
  - Configuración → `/clientes`

### ✅ Registro Form (`/registro-form`)

- Formulario completo reactivo con validaciones
- Dropdowns dinámicos: Cliente, Chofer, Placas, Descripciones
- Captura de foto con Capacitor Camera
- Firmas digitales (entregado y representante)
- Confirmación antes de guardar

### ✅ Lista de Registros (`/registro-lista`)

- Tabla con todos los registros
- Filtros: fecha inicio/fin, cliente, estado
- Búsqueda en tiempo real
- Paginación (15 por página)
- Cambio rápido de estado (deslizar)
- Botón exportar a Excel

### ✅ Detalle de Registro (`/registro-detalle/:id`)

- Visualización completa de datos
- Información de cliente, transporte, carga
- Mostrar firmas digitales
- Acciones: Aprobar, Rechazar, Descargar PDF, Eliminar
- Ver imagen capturada

### ✅ Gestión de Clientes (`/clientes`)

- Lista completa de clientes
- Búsqueda por nombre, código, RUC
- Activar/desactivar clientes (deslizar)
- Botón flotante para nuevo cliente
- Editar/Eliminar con deslizar

### ✅ Formulario de Cliente (`/clientes/nuevo`, `/clientes/editar/:id`)

- Campos: código, nombre, RUC, dirección, teléfono, email
- Validaciones completas
- Toggle activo/inactivo
- Confirmación antes de guardar

### ⏳ Próximamente

- Gestión de Choferes
- Gestión de Placas
- Gestión de Descripciones de Jabas
- Reportes avanzados
- Autenticación Microsoft OAuth

## 🔌 Servicios API

### ApiService (`src/app/services/api.service.ts`)

Servicio centralizado para comunicación con el backend Laravel.

**Endpoints disponibles:**

```typescript
// Clientes
getClientes()
getClientesActivos()
getCliente(id)
createCliente(data)
updateCliente(id, data)
deleteCliente(id)

// Choferes
getChoferes()
getChoferesActivos()
// ... CRUD completo

// Placas
getPlacas()
getPlacasActivas()
// ... CRUD completo

// Descripciones Jabas
getDescripcionesJabas()
getDescripcionesJabasActivas()
// ... CRUD completo

// Registros
getRegistros(filters?)
getRegistro(id)
createRegistro(formData)
updateRegistro(id, formData)
deleteRegistro(id)
cambiarEstadoRegistro(id, estado, motivo?)
adjuntarPdfRegistro(id, pdf)
exportarRegistros()
```

## 📦 Estructura de Datos

### Interfaces TypeScript

```typescript
interface Cliente {
  id: number;
  codigo: string;
  nombre: string;
  ruc?: string;
  activo: boolean;
}

interface Chofer {
  id: number;
  nombre: string;
  dni: string;
  licencia?: string;
  activo: boolean;
}

interface Registro {
  id?: number;
  numero_registro?: string; // Auto-generado
  fecha?: string; // Auto
  hora?: string; // Auto
  cliente_id: number;
  representante_cliente: string;
  chofer_id: number;
  placa_1_id?: number;
  cantidad_jabas_1: number;
  cantidad_parihuelas: number;
  estado?: "por_aprobar" | "aprobado" | "rechazado";
  // ... más campos
}
```

## 🎨 Componentes Ionic Usados

- `IonCard` - Tarjetas de navegación e información
- `IonList` / `IonItem` - Formularios
- `IonSelect` - Dropdowns
- `IonInput` - Campos de texto/número
- `IonTextarea` - Observaciones
- `IonButton` - Acciones
- `IonIcon` - Iconos (ionicons)
- `LoadingController` - Spinners de carga
- `ToastController` - Notificaciones
- `AlertController` - Confirmaciones

## 📷 Capacitor Plugins

### Camera

```typescript
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

const image = await Camera.getPhoto({
  quality: 90,
  resultType: CameraResultType.DataUrl,
  source: CameraSource.Camera,
});
```

### Otros Plugins Instalados

- `@capacitor/app` - Ciclo de vida de la app
- `@capacitor/keyboard` - Control del teclado
- `@capacitor/status-bar` - Barra de estado
- `@capacitor/haptics` - Vibraciones

## 🔧 Configuración

### Environment (`src/environments/environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:8000/api/v1",
};
```

### Rutas (`src/app/app.routes.ts`)

```typescript
const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./pages/home.page"),
  },
  {
    path: "registro/nuevo",
    loadComponent: () => import("./pages/registro-form.page"),
  },
];
```

## 🚧 Próximos Desarrollos

1. **Lista de Registros**

   - Tabla/Cards con registros
   - Filtros por fecha, cliente, estado
   - Búsqueda en tiempo real
   - Paginación

2. **Vista de Detalle**

   - Ver información completa del registro
   - Mostrar imagen capturada
   - Botones de aprobar/rechazar
   - Adjuntar PDF

3. **Firmas Digitales**

   - Canvas para firma del entregado
   - Canvas para firma del representante
   - Guardar como base64

4. **Reportes**

   - Filtros avanzados
   - Vista previa
   - Exportar a Excel
   - Generar PDF

5. **Autenticación**
   - Login con Microsoft Account
   - Gestión de tokens
   - Guards en rutas

## 📝 Notas

- La aplicación usa **Standalone Components** (sin NgModules)
- Formularios **Reactivos** para mejor validación
- **HttpClient** configurado globalmente
- Diseño **Responsive** para web y móvil
- Los assets se cargan dinámicamente del backend

## 🐛 Troubleshooting

### Error: Node.js version v20.9.0 detected

La CLI de Angular requiere Node >= 20.19 o >= 22.12.
**Solución:** Archivos creados manualmente.

### CORS Error

Verificar que el backend esté corriendo en `http://localhost:8000` y que CORS esté habilitado.

### Camera no funciona en web

El plugin de cámara requiere dispositivo físico o emulador. En web, solicita permisos de la cámara del navegador.
