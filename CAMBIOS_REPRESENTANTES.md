# Implementación de Representantes de Clientes

## Resumen de Cambios

Se ha implementado un sistema de gestión de representantes de clientes con relación uno a muchos, permitiendo que cada cliente tenga múltiples representantes, identificando cuál está activo.

---

## 🔧 Cambios en Backend

### 1. Nueva Tabla: `representantes_clientes`

**Migración:** `2024_01_20_000001_create_representantes_clientes_table.php`

Campos:

- `id` - ID único
- `cliente_id` - FK a clientes
- `nombre` - Nombre del representante (requerido)
- `dni` - DNI del representante (8 dígitos, opcional)
- `telefono` - Teléfono (opcional)
- `email` - Email (opcional)
- `cargo` - Cargo del representante (opcional)
- `activo` - Boolean para identificar representante activo (default: true)
- `created_at`, `updated_at` - Timestamps

**Características:**

- Relación `belongsTo` con Cliente
- Al crear/editar, si se marca como activo, desactiva automáticamente los demás representantes del mismo cliente
- Migración automática de representantes existentes desde la tabla `registros`

### 2. Actualización Tabla `clientes`

**Migración:** `2025_11_03_210605_create_clientes_table.php`

Cambios:

- Campo `codigo` ahora es **NULLABLE** (antes era requerido)
- Permite crear clientes sin código específico

### 3. Actualización Tabla `registros`

**Migración:** `2024_01_20_000002_add_representante_cliente_id_to_registros.php`

Cambios:

- Nuevo campo `representante_cliente_id` (FK a `representantes_clientes`, nullable)
- Campo `representante_cliente` (string) se mantiene como **nullable** para compatibilidad con registros antiguos
- Al crear registro con `representante_cliente_id`, se copia automáticamente el nombre al campo legacy

### 4. Nuevos Modelos

#### **RepresentanteCliente** (`app/Models/RepresentanteCliente.php`)

```php
protected $fillable = [
    'cliente_id', 'nombre', 'dni', 'telefono', 'email', 'cargo', 'activo'
];

// Relaciones
public function cliente() // belongsTo Cliente
```

#### **Cliente** (actualizado)

```php
// Nuevas relaciones
public function representantes() // hasMany RepresentanteCliente
public function representanteActivo() // hasOne RepresentanteCliente where activo=true
```

#### **Registro** (actualizado)

```php
// Nueva relación
public function representanteCliente() // belongsTo RepresentanteCliente
```

### 5. Nuevo Controlador

**RepresentanteClienteController** (`app/Http/Controllers/Api/RepresentanteClienteController.php`)

Endpoints disponibles:

| Método | Endpoint                                          | Descripción                                   |
| ------ | ------------------------------------------------- | --------------------------------------------- |
| GET    | `/api/v1/representantes-clientes`                 | Lista todos los representantes                |
| GET    | `/api/v1/representantes-clientes?cliente_id={id}` | Filtra por cliente                            |
| GET    | `/api/v1/representantes-clientes/{id}`            | Muestra un representante                      |
| POST   | `/api/v1/representantes-clientes`                 | Crea un representante                         |
| PUT    | `/api/v1/representantes-clientes/{id}`            | Actualiza un representante                    |
| DELETE | `/api/v1/representantes-clientes/{id}`            | Elimina un representante                      |
| POST   | `/api/v1/representantes-clientes/{id}/activar`    | Activa un representante (desactiva los demás) |

### 6. Actualización de Controladores Existentes

#### **ClienteController**

- `index()` y `show()` ahora incluyen `representanteActivo` y `representantes` en las relaciones
- Validación de `codigo` ya no es requerida

#### **RegistroController**

- `index()` y `show()` incluyen relación `representanteCliente`
- `store()` valida `representante_cliente_id` (opcional)
- Al guardar con `representante_cliente_id`, copia automáticamente el nombre del representante al campo `representante_cliente`

### 7. Seeder

**RepresentanteClienteSeeder** (`database/seeders/RepresentanteClienteSeeder.php`)

- Crea 2-3 representantes por cliente existente
- Solo el primero está marcado como activo
- Datos de ejemplo realistas (nombres, DNI, teléfonos, emails, cargos)

---

## 🎨 Cambios en Frontend

### 1. Actualización de Interfaces TypeScript

**api.service.ts**

```typescript
export interface RepresentanteCliente {
  id: number;
  cliente_id: number;
  nombre: string;
  dni?: string;
  telefono?: string;
  email?: string;
  cargo?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
  cliente?: Cliente;
}

export interface Cliente {
  // ... campos existentes
  representante_activo?: RepresentanteCliente;
  representantes?: RepresentanteCliente[];
}

export interface Registro {
  // ... campos existentes
  representante_cliente_id?: number;
  representanteCliente?: RepresentanteCliente;
}
```

### 2. Nuevos Métodos en ApiService

```typescript
// Representantes de Clientes
getRepresentantesClientes(clienteId?: number)
getRepresentanteCliente(id: number)
createRepresentanteCliente(data: Partial<RepresentanteCliente>)
updateRepresentanteCliente(id: number, data: Partial<RepresentanteCliente>)
deleteRepresentanteCliente(id: number)
activarRepresentanteCliente(id: number)
```

### 3. Actualización Formulario de Clientes

**cliente-form.page.ts**

Nuevas propiedades:

- `representantes: RepresentanteCliente[]`
- `mostrarFormRepresentante: boolean`
- `representanteEditandoId: number | null`

Nuevos campos en el formulario:

- `representante_nombre`
- `representante_dni`
- `representante_telefono`
- `representante_email`
- `representante_cargo`
- `representante_activo`

Nuevos métodos:

- `cargarRepresentantes()`
- `mostrarAgregarRepresentante()`
- `editarRepresentante(representante)`
- `cancelarRepresentante()`
- `guardarRepresentante()`
- `eliminarRepresentante(id)`
- `activarRepresentante(id)`

**cliente-form.page.html**

- Campo `Código` ya no tiene asterisco de requerido
- Nueva sección "Representantes" (solo visible en modo edición)
- Formulario inline para agregar/editar representantes
- Lista de representantes con badge "ACTIVO"
- Botones para activar, editar y eliminar representantes

### 4. Actualización Formulario de Registros

**registro-form.page.ts**

Cambios:

- Nuevo array: `representantesCliente: RepresentanteCliente[]`
- Campo del formulario cambiado de `representante_cliente` (string) a `representante_cliente_id` (number)
- Suscripción a cambios de `cliente_id` para cargar representantes automáticamente
- Preselección del representante activo al seleccionar cliente
- Nuevo método: `cargarRepresentantesCliente(clienteId)`

**registro-form.page.html**

- Campo "Representante del Cliente" ahora es un `ion-select`
- Se deshabilita si no hay representantes para el cliente seleccionado
- Muestra nombre del representante con indicador "(ACTIVO)" y cargo
- Nota de advertencia si el cliente no tiene representantes

### 5. Actualización Vistas de Registros

**registro-detalle.page.html**

```html
<p *ngIf="registro.representanteCliente">
  {{ registro.representanteCliente.nombre }}
  <span *ngIf="registro.representanteCliente.cargo">
    - {{ registro.representanteCliente.cargo }}</span
  >
</p>
<p *ngIf="!registro.representanteCliente && registro.representante_cliente">
  {{ registro.representante_cliente }}
</p>
```

**registro-lista.page.html**

- Nuevo renglón mostrando representante con ícono
- Fallback a campo legacy si no hay relación

---

## 📊 Flujo de Trabajo

### Crear un Cliente con Representantes

1. **Crear Cliente**

   - Ir a Clientes → Nuevo Cliente
   - Llenar información básica (código es opcional)
   - Guardar

2. **Agregar Representantes** (después de crear)

   - Editar el cliente recién creado
   - Click en ícono "+" en sección Representantes
   - Llenar datos del representante
   - Marcar checkbox "Representante Activo" si aplica
   - Guardar

3. **Gestionar Representantes**
   - **Activar:** Click en ícono ✓ (desactiva automáticamente los demás)
   - **Editar:** Click en ícono lápiz
   - **Eliminar:** Click en ícono basura (con confirmación)

### Crear un Registro

1. **Seleccionar Cliente**

   - El select carga todos los clientes activos

2. **Seleccionar Representante**

   - Al seleccionar cliente, se cargan automáticamente sus representantes
   - El representante activo se preselecciona automáticamente
   - Se puede cambiar a otro representante del mismo cliente
   - Si el cliente no tiene representantes, aparece advertencia

3. **Guardar Registro**
   - Se guarda el `representante_cliente_id`
   - El nombre del representante se copia automáticamente al campo `representante_cliente` (legacy)

---

## 🔄 Compatibilidad hacia atrás

### Registros Antiguos

Los registros existentes que solo tienen el campo `representante_cliente` (string):

- Se mostrarán correctamente en todas las vistas
- El campo legacy `representante_cliente` se mantiene nullable
- Al editar un registro antiguo, se puede asignar un representante del catálogo

### Migración Automática

La migración de representantes incluye:

```sql
INSERT INTO representantes_clientes (cliente_id, nombre, activo, created_at, updated_at)
SELECT DISTINCT cliente_id, representante_cliente, true, NOW(), NOW()
FROM registros
WHERE representante_cliente IS NOT NULL AND representante_cliente != ''
```

Esto crea representantes en el catálogo a partir de registros existentes.

---

## 🎯 Validaciones

### Backend

- **RepresentanteCliente:**

  - `cliente_id`: requerido, debe existir
  - `nombre`: requerido, máx 255 caracteres
  - `dni`: opcional, máx 8 caracteres
  - `email`: opcional, formato email válido

- **Registro:**
  - `representante_cliente_id`: opcional, debe existir si se envía
  - `representante_cliente`: opcional, máx 255 caracteres

### Frontend

- **Cliente:**
  - `codigo`: ya no es requerido
- **Representante:**

  - `nombre`: requerido al guardar
  - `dni`: patrón 8 dígitos
  - `email`: formato email válido

- **Registro:**
  - `representante_cliente_id`: requerido

---

## 📝 Notas Importantes

1. **Solo un representante activo por cliente**

   - Al activar un representante, los demás se desactivan automáticamente
   - Lógica manejada tanto en backend como frontend

2. **Campo código de cliente opcional**

   - Permite mayor flexibilidad al crear clientes
   - Se puede agregar después si es necesario

3. **Relación nullable en registros**

   - `representante_cliente_id` es nullable por compatibilidad
   - Si se elimina un representante, los registros asociados mantienen el campo nullable (nullOnDelete)

4. **Representantes solo se gestionan desde el formulario de cliente**
   - No hay CRUD independiente en el menú
   - Se administran dentro del contexto del cliente

---

## 🚀 Comandos Ejecutados

```bash
# Ejecutar migraciones
php artisan migrate

# Ejecutar seeder de representantes
php artisan db:seed --class=RepresentanteClienteSeeder
```

---

## ✅ Testing Sugerido

1. Crear un cliente nuevo sin código
2. Agregar 2-3 representantes al cliente
3. Activar diferentes representantes y verificar que solo uno quede activo
4. Crear un registro seleccionando el cliente
5. Verificar que el representante activo se preselecciona
6. Cambiar a otro representante y guardar
7. Ver el detalle del registro y confirmar que muestra el representante con su cargo
8. Editar un representante y verificar que los registros se actualizan
9. Verificar que registros antiguos siguen mostrándose correctamente
