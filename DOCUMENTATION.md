# Control de Alquiler de Jabas y Parihuelas

Sistema de gestión logística para el control de alquiler de jabas (cajas) y parihuelas (pallets) desarrollado con Laravel 10 y Ionic 7 (Angular 20).

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Funcionalidades](#funcionalidades)
- [API Endpoints](#api-endpoints)
- [Uso](#uso)

## ✨ Características

- ✅ Gestión completa de registros de alquiler (CRUD)
- ✅ Sistema de tres estados: Por Aprobar, Aprobado, Rechazado
- ✅ Generación automática de números de registro (DDMM-####)
- ✅ Captura de fotografías mediante Capacitor
- ✅ Firmas digitales (2 canvas)
- ✅ Generación de PDFs profesionales
- ✅ Exportación a Excel con filtros
- ✅ Administración de maestros:
  - Clientes (con RUC, contacto, dirección)
  - Choferes (con DNI, licencia, teléfono)
  - Placas (con tipo de vehículo, marca, modelo, año)
  - Descripciones de Jabas y Parihuelas (con código, color, material, capacidad)
- ✅ Búsqueda y filtrado avanzado
- ✅ Estados activo/inactivo para todos los maestros
- ✅ Interfaz responsiva para web y móvil

## 🚀 Tecnologías

### Backend

- **Laravel 10** - Framework PHP
- **MySQL** - Base de datos
- **DomPDF v3.1.1** - Generación de PDFs
- **Laravel Excel v3.1** - Exportación a Excel
- **Laravel Sanctum** - Autenticación API
- **CORS** - Configurado para frontend

### Frontend

- **Ionic 7** - Framework híbrido
- **Angular 20** - Framework JavaScript
- **Capacitor** - Acceso a funcionalidades nativas
- **Standalone Components** - Arquitectura moderna
- **Reactive Forms** - Validaciones robustas

## 📦 Requisitos

### Backend

- PHP >= 8.1
- Composer >= 2.6
- MySQL >= 8.0
- Extensiones PHP: mbstring, openssl, pdo, tokenizer, xml, gd

### Frontend

- Node.js >= v20.19.0
- npm >= 10.x
- Ionic CLI >= 7.x

## 🔧 Instalación

### Backend (Laravel)

1. **Clonar el repositorio e ingresar al directorio backend**

```bash
cd backend
```

2. **Instalar dependencias**

```bash
composer install
```

3. **Configurar el archivo .env**

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales de base de datos:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=alquiler_jabas
DB_USERNAME=root
DB_PASSWORD=
```

4. **Generar la clave de aplicación**

```bash
php artisan key:generate
```

5. **Crear la base de datos**

```bash
mysql -u root -p
CREATE DATABASE alquiler_jabas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

6. **Ejecutar las migraciones**

```bash
php artisan migrate
```

7. **Ejecutar los seeders (datos de prueba)**

```bash
php artisan db:seed
```

Esto creará:

- 5 clientes
- 8 choferes
- 15 placas (camiones, furgonetas, camionetas)
- 10 descripciones (6 jabas + 4 parihuelas)

8. **Crear enlace simbólico para el storage**

```bash
php artisan storage:link
```

9. **Iniciar el servidor**

```bash
php artisan serve
```

El backend estará disponible en: `http://127.0.0.1:8000`

### Frontend (Ionic)

1. **Ingresar al directorio frontend**

```bash
cd frontend
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar la URL del backend**

Editar `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: "http://127.0.0.1:8000/api/v1",
};
```

4. **Iniciar el servidor de desarrollo**

```bash
ionic serve
```

El frontend estará disponible en: `http://localhost:8100`

## 📁 Estructura del Proyecto

```
alquiler_jabas_parihuelas/
├── backend/
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── ClienteController.php
│   │   │   ├── ChoferController.php
│   │   │   ├── PlacaController.php
│   │   │   ├── DescripcionJabaController.php
│   │   │   └── RegistroController.php
│   │   ├── Models/
│   │   │   ├── Cliente.php
│   │   │   ├── Chofer.php
│   │   │   ├── Placa.php
│   │   │   ├── DescripcionJaba.php
│   │   │   └── Registro.php
│   │   └── Exports/
│   │       └── RegistrosExport.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── resources/views/pdf/
│   │   └── registro.blade.php
│   └── routes/
│       └── api.php
│
└── frontend/
    └── src/app/
        ├── pages/
        │   ├── registro-form.page.ts
        │   ├── registro-lista.page.ts
        │   ├── registro-detalle.page.ts
        │   ├── clientes/
        │   │   ├── clientes-lista.page.*
        │   │   └── cliente-form.page.*
        │   ├── choferes/
        │   │   ├── choferes-lista.page.*
        │   │   └── chofer-form.page.*
        │   ├── placas/
        │   │   ├── placas-lista.page.*
        │   │   └── placa-form.page.*
        │   ├── descripciones/
        │   │   ├── descripciones-lista.page.*
        │   │   └── descripcion-form.page.*
        │   └── configuracion/
        │       └── configuracion.page.*
        ├── services/
        │   └── api.service.ts
        ├── home/
        │   └── home.page.*
        └── app.routes.ts
```

## 🎯 Funcionalidades

### Página Principal (Home)

- **Nuevo Registro**: Crear registro de alquiler
- **Lista de Registros**: Ver, filtrar y gestionar registros
- **Reportes**: Generar reportes y estadísticas
- **Configuración**: Administrar datos maestros

### Registros

- Crear/Editar/Eliminar registros
- Estados: Por Aprobar, Aprobado, Rechazado
- Número autogenerado (formato: DDMM-####)
- Captura de fotos
- Firmas digitales (Firma del chofer y Firma del cliente)
- Detalles completos:
  - Cliente, Chofer, Placa(s)
  - Cantidades entregadas/recibidas
  - Descripciones de jabas/parihuelas
  - Observaciones
- Generación de PDF individual
- Exportación masiva a Excel

### Clientes

- Lista con búsqueda por código, nombre, RUC
- Formulario con validaciones:
  - Código (requerido)
  - Nombre (requerido)
  - RUC (11 dígitos)
  - Email (formato válido)
  - Dirección, Teléfono
- Activar/Desactivar clientes
- Eliminar con confirmación

### Choferes

- Lista con avatares y búsqueda
- Formulario con validaciones:
  - Nombre (requerido)
  - DNI (8 dígitos, requerido)
  - Licencia de conducir
  - Teléfono
- Activar/Desactivar choferes
- Eliminar con confirmación

### Placas

- Lista con iconos dinámicos según tipo de vehículo
- Formulario con:
  - Número de placa (requerido)
  - Tipo (Camión, Furgoneta, Camioneta, Otro)
  - Marca, Modelo
  - Año
- Activar/Desactivar placas
- Eliminar con confirmación

### Descripciones

- Lista de jabas y parihuelas
- Búsqueda por código, descripción, color, material
- Formulario con:
  - Código (requerido, ej: J-001, P-001)
  - Descripción (requerido)
  - Color (lista predefinida)
  - Material (Plástico, Madera, Metal, etc.)
  - Capacidad en kg
- Activar/Desactivar descripciones
- Chips visuales para color y material

## 🔌 API Endpoints

### Clientes

```
GET    /api/v1/clientes              - Listar todos
GET    /api/v1/clientes/activos      - Listar activos
GET    /api/v1/clientes/{id}         - Obtener uno
POST   /api/v1/clientes              - Crear
PUT    /api/v1/clientes/{id}         - Actualizar
DELETE /api/v1/clientes/{id}         - Eliminar
```

### Choferes

```
GET    /api/v1/choferes              - Listar todos
GET    /api/v1/choferes/activos      - Listar activos
GET    /api/v1/choferes/{id}         - Obtener uno
POST   /api/v1/choferes              - Crear
PUT    /api/v1/choferes/{id}         - Actualizar
DELETE /api/v1/choferes/{id}         - Eliminar
```

### Placas

```
GET    /api/v1/placas                - Listar todas
GET    /api/v1/placas/activas        - Listar activas
GET    /api/v1/placas/{id}           - Obtener una
POST   /api/v1/placas                - Crear
PUT    /api/v1/placas/{id}           - Actualizar
DELETE /api/v1/placas/{id}           - Eliminar
```

### Descripciones de Jabas

```
GET    /api/v1/descripciones-jabas             - Listar todas
GET    /api/v1/descripciones-jabas/activas     - Listar activas
GET    /api/v1/descripciones-jabas/{id}        - Obtener una
POST   /api/v1/descripciones-jabas             - Crear
PUT    /api/v1/descripciones-jabas/{id}        - Actualizar
DELETE /api/v1/descripciones-jabas/{id}        - Eliminar
```

### Registros

```
GET    /api/v1/registros                       - Listar todos
GET    /api/v1/registros/{id}                  - Obtener uno
POST   /api/v1/registros                       - Crear
PUT    /api/v1/registros/{id}                  - Actualizar
DELETE /api/v1/registros/{id}                  - Eliminar
GET    /api/v1/registros/{id}/generar-pdf     - Generar PDF
GET    /api/v1/registros/exportar/excel       - Exportar a Excel
```

### Parámetros de Exportación Excel

```
?fecha_inicio=2025-01-01
&fecha_fin=2025-12-31
&cliente_id=1
&chofer_id=2
&estado=aprobado
```

## 📱 Uso

### Flujo de Trabajo Típico

1. **Configurar Datos Maestros**

   - Ir a Configuración
   - Agregar Clientes, Choferes, Placas, Descripciones

2. **Crear Registro**

   - Desde Home → "Nuevo Registro"
   - Seleccionar Cliente, Chofer, Placa(s)
   - Ingresar cantidades entregadas/recibidas
   - Seleccionar descripciones de jabas/parihuelas
   - Capturar fotografía
   - Agregar firmas digitales
   - Guardar (estado: "Por Aprobar")

3. **Gestionar Registros**

   - Desde Home → "Lista de Registros"
   - Buscar/Filtrar por fecha, cliente, estado
   - Ver detalle completo
   - Aprobar/Rechazar registros
   - Descargar PDF individual
   - Exportar a Excel con filtros

4. **Generar Reportes**
   - Lista de Registros → Botón "Exportar Excel"
   - Aplicar filtros (fechas, cliente, chofer, estado)
   - Descargar archivo Excel con 20 columnas

## 🔐 Validaciones

### Cliente

- Código: requerido, único
- Nombre: requerido, máx 255 caracteres
- RUC: opcional, 11 dígitos
- Email: opcional, formato válido

### Chofer

- Nombre: requerido, máx 255 caracteres
- DNI: requerido, 8 dígitos, único
- Licencia: opcional, máx 20 caracteres
- Teléfono: opcional, máx 20 caracteres

### Placa

- Número de placa: requerido, único, máx 10 caracteres
- Tipo de vehículo: opcional
- Marca/Modelo: opcional, máx 50 caracteres
- Año: opcional, entre 1900-2100

### Descripción

- Código: requerido, único, máx 20 caracteres
- Descripción: requerido, máx 255 caracteres
- Color/Material: opcional, listas predefinidas
- Capacidad: opcional, numérico positivo

## 🎨 Características UI/UX

- **Búsqueda en tiempo real** en todas las listas
- **Iconos contextuales**: avatares para choferes, iconos dinámicos para vehículos
- **Badges de estado**: colores diferenciados (Activo/Inactivo, Aprobado/Rechazado)
- **Ion-item-sliding**: acciones rápidas (activar/desactivar, eliminar)
- **Alertas de confirmación**: para acciones críticas
- **Spinners de carga**: feedback visual durante operaciones
- **Formularios reactivos**: validación en tiempo real
- **Estados vacíos**: mensajes cuando no hay datos
- **Refresh**: pull-to-refresh en listas
- **Responsive**: adaptado para móvil y escritorio

## 📄 Formato de PDF

El PDF generado incluye 8 secciones:

1. Encabezado con logo y número de registro
2. Información del registro (fecha, hora, estado)
3. Cliente y chofer
4. Placas (hasta 2)
5. Cantidades entregadas/recibidas
6. Descripciones de jabas/parihuelas (hasta 2)
7. Observaciones
8. Firmas digitales (chofer y cliente)

## 📊 Formato de Excel

20 columnas exportadas:

- Número de Registro, Fecha, Hora
- Cliente (Código, Nombre, RUC)
- Chofer (Nombre, DNI)
- Placa 1 y 2 (Número, Tipo)
- Cantidades (Entregada, Recibida)
- Descripciones (Jaba 1, Jaba 2)
- Estado, Observaciones
- Firmas (Chofer, Cliente)
- Usuario, Fecha de Creación

## 🐛 Troubleshooting

### Error: Node.js version

```
Error: La versión actual de Node.js es v20.9.0, se requiere v20.19.0 o superior
```

**Solución**: Actualizar Node.js desde https://nodejs.org/

### Error: CORS

```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solución**: Verificar que `config/cors.php` tenga `'supports_credentials' => true`

### Error: Storage not found

```
The file "public/fotos/xxx.jpg" does not exist
```

**Solución**: Ejecutar `php artisan storage:link`

### Error: Class not found en PDF

```
Class 'Barryvdh\DomPDF\Facade\Pdf' not found
```

**Solución**: Ejecutar `composer dump-autoload`

## 🔜 Próximas Funcionalidades

- [ ] Autenticación Microsoft OAuth
- [ ] Dashboard con gráficos estadísticos
- [ ] Notificaciones push
- [ ] Modo offline con sincronización
- [ ] Historial de cambios (audit log)
- [ ] Importación masiva desde Excel
- [ ] Multi-idioma (i18n)
- [ ] Temas claro/oscuro

## 📝 Licencia

Este proyecto es privado y confidencial.

## 👥 Autor

Desarrollado para la gestión logística de alquiler de jabas y parihuelas.

---

**Versión**: 1.0.0  
**Última actualización**: Marzo 2025
