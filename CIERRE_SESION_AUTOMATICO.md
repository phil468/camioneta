# Cierre Automático de Sesión para Usuarios Inactivos

## 📋 Problema Resuelto

Cuando un usuario es **desactivado** o **eliminado** de la base de datos, su sesión activa continuaba funcionando porque el token JWT seguía siendo válido. Esto representaba un riesgo de seguridad.

## ✅ Solución Implementada

Se implementó un sistema de **validación en tiempo real** que verifica el estado del usuario en cada petición a la API.

---

## 🔧 Componentes Backend

### 1. Middleware `CheckUserActive`

**Ubicación:** `backend/app/Http/Middleware/CheckUserActive.php`

**Función:**

- Verifica en cada petición si el usuario autenticado está activo
- Si el usuario está inactivo (`activo = false`), automáticamente:
  - Revoca el token de acceso actual (Sanctum)
  - Retorna error 403 con flag `logout: true`
  - Envía mensaje claro al usuario

**Código clave:**

```php
if (Auth::check()) {
    $user = Auth::user();

    if (!$user->activo) {
        // Revocar token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => false,
            'message' => 'Tu cuenta ha sido desactivada. Contacta al administrador.',
            'logout' => true
        ], 403);
    }
}
```

### 2. Registro del Middleware

**Ubicación:** `backend/app/Http/Kernel.php`

Se registró el middleware con el alias `user.active`:

```php
protected $middlewareAliases = [
    // ... otros middlewares
    'user.active' => \App\Http\Middleware\CheckUserActive::class,
];
```

### 3. Aplicación en Rutas

**Ubicación:** `backend/routes/api.php`

Se aplicó el middleware a **todas las rutas protegidas**:

```php
Route::middleware(['auth:sanctum', 'user.active'])->prefix('v1')->group(function () {
    // Todas las rutas CRUD
    Route::apiResource('clientes', ClienteController::class);
    Route::apiResource('registros', RegistroController::class);
    // ... etc
});
```

---

## 🎨 Componentes Frontend

### 1. Interceptor HTTP Actualizado

**Ubicación:** `frontend/src/app/interceptors/auth.interceptor.ts`

**Función:**

- Captura errores HTTP 403 con flag `logout: true`
- Cierra sesión automáticamente
- Redirige al login con mensaje de error

**Código clave:**

```typescript
catchError((error: HttpErrorResponse) => {
  if (error.status === 401) {
    // Token expirado
    this.authService.logout();
  } else if (error.status === 403 && error.error?.logout) {
    // Usuario desactivado
    this.authService.logout();
    this.router.navigate(["/login"], {
      queryParams: {
        error: "Tu cuenta ha sido desactivada. Contacta al administrador.",
      },
      replaceUrl: true,
    });
  }
  return throwError(() => error);
});
```

### 2. Página de Login

**Ubicación:** `frontend/src/app/pages/login/login.page.ts`

La página de login ya está configurada para:

- Leer el parámetro `error` de la URL
- Mostrar un AlertController con el mensaje
- Limpiar la URL después de mostrar el error

---

## 🔄 Flujo Completo

### Escenario 1: Usuario se desactiva mientras está usando el sistema

1. **Usuario A** está navegando en la aplicación
2. **Administrador** desactiva al Usuario A desde el CRUD de usuarios
3. Usuario A hace clic en cualquier sección (ej: ver registros)
4. **Backend** recibe la petición → Middleware verifica estado
5. **Middleware** detecta `activo = false` → Revoca token → Retorna 403
6. **Interceptor** captura error 403 → Cierra sesión → Redirige a login
7. **Login page** muestra alerta: "Tu cuenta ha sido desactivada. Contacta al administrador."

### Escenario 2: Usuario eliminado

1. **Usuario B** está en sesión activa
2. **Administrador** elimina al Usuario B de la base de datos
3. Usuario B intenta cualquier acción
4. **Backend** → `Auth::check()` retorna `null` (usuario no existe)
5. Laravel Sanctum responde automáticamente con **401 Unauthorized**
6. **Interceptor** captura 401 → Cierra sesión → Redirige a login

---

## 🎯 Ventajas

✅ **Seguridad inmediata:** No hay que esperar a que expire el token  
✅ **Sin intervalo de polling:** No consume recursos verificando cada X segundos  
✅ **Experiencia de usuario clara:** Mensaje específico del motivo del cierre  
✅ **Revocación de token:** El token se elimina de la BD, no solo del localStorage  
✅ **Aplicación global:** Funciona en todas las rutas protegidas automáticamente

---

## 🧪 Cómo Probar

1. **Crear un usuario de prueba**

   ```sql
   INSERT INTO users (name, email, password, activo)
   VALUES ('Test User', 'test@test.com', '$2y$10$...', 1);
   ```

2. **Iniciar sesión** con ese usuario en el frontend

3. **Desactivar el usuario** desde el CRUD de Usuarios (toggle activo a OFF)

4. **Realizar cualquier acción** en el sistema (navegar a registros, dashboard, etc.)

5. **Resultado esperado:**
   - Cierre de sesión inmediato
   - Redirección a `/login`
   - Alerta con mensaje: "Tu cuenta ha sido desactivada. Contacta al administrador."

---

## 📝 Notas Técnicas

- **Middleware ejecuta en cada petición:** No hay retraso, la validación es instantánea
- **Compatible con Sanctum:** Usa `currentAccessToken()->delete()` para revocar tokens
- **Sin cambios en tablas:** Usa el campo `activo` que ya existe en la tabla `users`
- **Error 403 vs 401:**
  - **401:** Token inválido/expirado (problema técnico)
  - **403:** Usuario desactivado (decisión administrativa)

---

## 🔐 Seguridad

Esta implementación asegura que:

- Un usuario desactivado **no puede** hacer ninguna operación
- Su token es **revocado inmediatamente** de la base de datos
- No puede volver a usar el token anterior aunque lo tenga en localStorage
- El mensaje es claro pero no da detalles técnicos del sistema

---

## 🚀 Próximas Mejoras (Opcional)

- [ ] Registro de auditoría cuando se desactiva un usuario
- [ ] Notificación por email al usuario desactivado
- [ ] Panel de administración para ver sesiones activas
- [ ] Opción de "desactivar y revocar todas las sesiones"
