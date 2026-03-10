# Control de Alquiler de Jabas y Parihuelas

Sistema de gestión para el control de alquiler de jabas y parihuelas con aplicación web y móvil.

## 📋 Descripción

Aplicación para gestionar el alquiler de jabas (cajas) y parihuelas (pallets) con las siguientes características:

- **Registro de Alquileres**: Formulario con campos automáticos y manuales
- **Estados de Documentos**: Por Aprobar (blanco), Aprobado (verde), Rechazado (rojo)
- **Lista de Registros**: Filtrado por fecha, cliente y estado
- **Reportes**: Exportación a Excel y generación de PDF
- **Firma Digital**: Captura de firma del entregado y representante del cliente
- **Captura de Fotos**: Evidencia visual mediante cámara del dispositivo
- **Autenticación**: Login con Microsoft Account (correo corporativo)

## 🏗️ Arquitectura

### Backend

- **Framework**: Laravel 10
- **Base de Datos**: MySQL
- **Autenticación**: Microsoft OAuth + Laravel Sanctum
- **API**: RESTful

### Frontend

- **Framework**: Ionic 7 + Angular 20
- **Plataformas**: Web y Móvil (iOS/Android)
- **Capacitor**: Para funcionalidades nativas (cámara, firma)

## 📁 Estructura del Proyecto

```
alquiler_jabas_parihuelas/
├── backend/          # Laravel API
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── ...
├── frontend/         # Ionic Angular App
│   ├── src/
│   ├── www/
│   └── ...
└── README.md
```

## 🚀 Instalación

### Requisitos Previos

- PHP >= 8.1
- Composer
- Node.js >= 20.9
- MySQL
- Ionic CLI (`npm install -g @ionic/cli`)
- ⚠️ **Laragon con MySQL corriendo**

### Backend (Laravel)

```bash
cd backend

# 1. Iniciar Laragon y MySQL
# 2. Crear BD: alquiler_jabas_parihuelas
# 3. Ejecutar migraciones
php artisan migrate
php artisan storage:link
php artisan serve  # http://localhost:8000
```

## ✅ Progreso del Proyecto

### Backend (Laravel) - 90% Completado ✅

- ✅ Migraciones creadas (clientes, choferes, placas, descripciones_jabas, registros)
- ✅ Modelos con relaciones y soft deletes
- ✅ API Controllers con CRUD completo
- ✅ Rutas API /v1 versionadas
- ✅ CORS configurado
- ✅ Auto-generación número de registro (DDMM-####)
- ✅ **Seeders con datos de prueba** (5 clientes, 8 choferes, 15 placas, 10 descripciones)
- ✅ **Generación de PDF** con DomPDF (diseño profesional, firmas, estados)
- ✅ **Exportación a Excel** con Laravel Excel (20 columnas, filtros, estilos)
- ⏳ Microsoft OAuth (pendiente)

### Frontend (Ionic) - 80% Completado ✅

- ✅ Proyecto base con Capacitor instalado
- ✅ **ApiService completo** con 50+ métodos y todas las interfaces TypeScript
- ✅ **Home Page** con tarjetas de navegación interactivas
- ✅ **Registro Form Page** con:
  - Formulario reactivo completo con validaciones
  - Dropdowns dinámicos (Cliente, Chofer, Placas, Descripciones)
  - Inputs de cantidades con validaciones
  - Captura de foto con Capacitor Camera
  - **Integración de firmas digitales** (2 canvas: entregado y representante)
  - Confirmación antes de guardar
- ✅ **Lista de Registros** con:
  - Filtros por fecha, cliente y estado
  - Búsqueda en tiempo real
  - Paginación (15 por página)
  - Cambio de estado (aprobar/rechazar) con deslizar
  - **Exportar a Excel con filtros**
  - Ion-item-sliding para acciones rápidas
- ✅ **Vista de Detalle** con:
  - Visualización completa de datos organizados en cards
  - Botones de aprobar/rechazar con motivo
  - **Descargar PDF generado del registro**
  - Ver imagen en modal
  - Eliminar registro con confirmación
- ✅ **Firma Digital Component** con:
  - Canvas responsivo para dibujar firma
  - Soporte táctil y mouse
  - Limpiar y guardar firma en base64
  - Integrado en formulario de registro
- ✅ **Gestión de Clientes** (CRUD completo):
  - Lista con búsqueda y filtros
  - Formulario crear/editar con validaciones
  - Activar/desactivar clientes
  - Eliminar con confirmación
- ✅ HttpClient y Router configurados
- ✅ Routing completo (11 rutas configuradas)
- ⚠️ Requiere Node.js v20.19+ (actual: v20.9.0)
- ⏳ Gestión de Choferes, Placas, Descripciones (CRUD)
- ⏳ Integración completa de Microsoft OAuth
- ⏳ Módulos de reportes avanzados

### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Configurar base de datos en .env
php artisan migrate
php artisan serve
```

### Frontend (Ionic)

```bash
cd frontend
npm install
ionic serve
```

## 🔧 Configuración

### Base de Datos

1. Crear base de datos MySQL
2. Configurar credenciales en `backend/.env`
3. Ejecutar migraciones: `php artisan migrate`

### Microsoft OAuth

1. Registrar aplicación en Azure AD
2. Obtener Client ID y Client Secret
3. Configurar en `.env` del backend

## 📱 Desarrollo

### Backend

```bash
cd backend
php artisan serve  # http://localhost:8000
```

### Frontend Web

```bash
cd frontend
ionic serve  # http://localhost:8100
```

### Frontend Móvil

```bash
cd frontend
ionic capacitor add android
ionic capacitor add ios
ionic capacitor run android
ionic capacitor run ios
```

## 📊 Modelos de Datos

- **Registros**: Documentos de alquiler
- **Clientes**: Tabla de mantenimiento de clientes
- **Choferes**: Tabla de mantenimiento de choferes
- **Placas**: Tabla de mantenimiento de placas de vehículos
- **Usuarios**: Autenticación con Microsoft

## 🎨 Características Principales

### Formulario de Registro

**Campos Automáticos:**

- Fecha (según día de registro)
- Hora (según momento de ingreso)
- N° Registro (formato automático)
- DNI (desde tabla de mantenimiento)
- Placa N° 1 (desde tabla)
- Placa N° 2 (desde tabla)

**Campos Manuales:**

- Cantidad de jabas
- Cantidad de parihuelas
- Observaciones
- Firma digital

**Campos Desplegables:**

- Cliente (tabla de mantenimiento)
- Representante Cliente (tabla)
- Chofer (tabla)
- Descripción de Jabas (tabla)

**Campos Específicos:**

- Captura de foto (cámara del dispositivo)
- Botones: Guardar, Cancelar, Listado

### Lista de Registros

- Filtros: Rango de fechas, Cliente, Estado
- Búsqueda por columnas
- Estados con colores (blanco/verde/rojo)
- Vista de documento
- Adjuntar PDF
- Exportar a Excel

### Reporte

Columnas incluidas:

- Fecha, Hora, N.º de Registro
- Cliente, Representante del Cliente
- Chofer, DNI, Placa
- Descripción de Jabas
- Cantidad de Jabas y Parihuelas
- Imagen, Estado
- Guía de Remisión

## 🔐 Seguridad

- Autenticación Microsoft OAuth
- Tokens JWT para API
- CORS configurado
- Middleware de autenticación

## 📄 Licencia

Proyecto privado - Grupo Vanguard Internacional

## 👥 Contacto

Desarrollo: Equipo TI - Grupo Vanguard
