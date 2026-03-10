# Configuración de Microsoft Azure AD OAuth

Este documento describe cómo configurar Microsoft Azure AD para la autenticación OAuth en el sistema de Control de Alquiler de Jabas y Parihuelas.

## 📋 Requisitos Previos

- Cuenta de Microsoft con acceso a Azure Portal
- Permisos de administrador en Azure AD (opcional pero recomendado)

## 🔧 Pasos de Configuración

### 1. Acceder al Azure Portal

1. Ir a https://portal.azure.com
2. Iniciar sesión con tu cuenta de Microsoft
3. En el menú, buscar "Azure Active Directory" o "Entra ID"

### 2. Registrar una Nueva Aplicación

1. En el menú lateral, seleccionar **App registrations** (Registros de aplicaciones)
2. Click en **+ New registration** (Nuevo registro)
3. Completar el formulario:
   - **Name**: Control de Alquiler - Jabas y Parihuelas
   - **Supported account types**:
     - Seleccionar "Accounts in any organizational directory and personal Microsoft accounts"
   - **Redirect URI**:
     - Tipo: **Web**
     - URL: `http://localhost:8000/api/v1/auth/microsoft/callback`
     - (En producción cambiar a tu dominio real)
4. Click en **Register**

### 3. Obtener las Credenciales

Después de crear la aplicación, verás la página de "Overview":

1. **Application (client) ID**: Copiar este valor

   - Este será tu `MICROSOFT_CLIENT_ID`

2. **Directory (tenant) ID**: También copiar (opcional)

### 4. Crear un Client Secret

1. En el menú lateral, seleccionar **Certificates & secrets**
2. En la pestaña **Client secrets**, click en **+ New client secret**
3. Completar:
   - **Description**: Backend Secret
   - **Expires**: 24 months (recomendado)
4. Click en **Add**
5. **IMPORTANTE**: Copiar el **Value** inmediatamente
   - Este será tu `MICROSOFT_CLIENT_SECRET`
   - ⚠️ Solo se muestra una vez, guárdalo en un lugar seguro

### 5. Configurar Permisos API

1. En el menú lateral, seleccionar **API permissions**
2. Por defecto ya incluye `User.Read` que es suficiente
3. Si necesitas más permisos, click en **+ Add a permission**:
   - **Microsoft Graph**
   - **Delegated permissions**
   - Seleccionar: `email`, `openid`, `profile`
4. Click en **Add permissions**

### 6. Configurar el Backend (Laravel)

1. Abrir el archivo `.env` en el backend
2. Agregar las siguientes variables:

```bash
MICROSOFT_CLIENT_ID=tu-client-id-aqui
MICROSOFT_CLIENT_SECRET=tu-client-secret-aqui
MICROSOFT_REDIRECT_URI=http://localhost:8000/api/v1/auth/microsoft/callback
```

3. Guardar el archivo

### 7. Configurar URLs de Redirección Adicionales

Para producción, agregar la URL de producción:

1. En Azure Portal, ir a **Authentication**
2. En **Platform configurations** → **Web**
3. Click en **+ Add URI**
4. Agregar: `https://tudominio.com/api/v1/auth/microsoft/callback`
5. Click en **Save**

## 🧪 Probar la Integración

### Desde el Frontend (Ionic)

1. Iniciar el backend: `php artisan serve`
2. Iniciar el frontend: `ionic serve`
3. Ir a la página de login: `http://localhost:8100/login`
4. Click en "Continuar con Microsoft"
5. Debería redirigir a Microsoft para autenticarse
6. Después de autenticarse, redirige de vuelta con un token

### Desde Postman/API

#### Login con Microsoft (Redirect)

```
GET http://localhost:8000/api/v1/auth/microsoft
```

Esto redirigirá a Microsoft. Después del login, llamará al callback.

#### Login Tradicional

```
POST http://localhost:8000/api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123"
}
```

#### Registro

```
POST http://localhost:8000/api/v1/auth/register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

#### Obtener Usuario Autenticado

```
GET http://localhost:8000/api/v1/auth/me
Authorization: Bearer {token}
```

#### Logout

```
POST http://localhost:8000/api/v1/auth/logout
Authorization: Bearer {token}
```

## 🔒 Seguridad

### Variables de Entorno

**NUNCA** subir el archivo `.env` a Git. Siempre usar `.env.example` como plantilla.

### Client Secret

- Guardar el Client Secret en un gestor de contraseñas
- Rotar el secret cada 6-12 meses
- Si el secret se compromete, crear uno nuevo inmediatamente

### Tokens

- Los tokens de Sanctum tienen una vida útil configurable
- Por defecto expiran después de inactividad
- Configurar en `config/sanctum.php`:

```php
'expiration' => 60, // Minutos
```

## 🌐 Producción

### Pasos Adicionales para Producción

1. **Cambiar APP_ENV a production** en `.env`
2. **Desactivar DEBUG**: `APP_DEBUG=false`
3. **Configurar HTTPS** obligatorio
4. **Actualizar Redirect URIs** en Azure AD con URLs HTTPS
5. **Configurar CORS** correctamente:

```php
// config/cors.php
'allowed_origins' => ['https://tudominio.com'],
'supports_credentials' => true,
```

6. **Optimizar Laravel**:

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 📝 Notas Importantes

### Múltiples Ambientes

Para desarrollo, staging y producción, crear apps separadas en Azure AD:

- **dev-alquiler-jabas**: Para desarrollo local
- **staging-alquiler-jabas**: Para ambiente de pruebas
- **prod-alquiler-jabas**: Para producción

### Usuarios de Prueba

Microsoft permite crear usuarios de prueba sin licencias:

1. En Azure AD → **Users** → **+ New user**
2. Crear usuarios de prueba para testing

### Logs y Debugging

Si hay errores en el OAuth:

1. Verificar logs de Laravel: `storage/logs/laravel.log`
2. Verificar que las URLs de callback coincidan exactamente
3. Verificar que el Client Secret no haya expirado
4. Revisar la consola del navegador para errores CORS

## 🆘 Troubleshooting

### Error: "AADSTS50011: The reply URL specified in the request does not match"

**Solución**: Verificar que la URL en Azure AD coincida exactamente con `MICROSOFT_REDIRECT_URI`

### Error: "invalid_client"

**Solución**:

- Verificar que `MICROSOFT_CLIENT_ID` y `MICROSOFT_CLIENT_SECRET` sean correctos
- Verificar que el secret no haya expirado

### Error: "CORS policy"

**Solución**:

- Verificar `config/cors.php`
- Asegurar que el frontend esté en `allowed_origins`
- Verificar que `supports_credentials` sea `true`

### Error: "Unauthenticated"

**Solución**:

- Verificar que el token esté en el header: `Authorization: Bearer {token}`
- Verificar que el token no haya expirado
- Verificar que el usuario exista en la base de datos

## 📚 Recursos Adicionales

- [Laravel Socialite Documentation](https://laravel.com/docs/10.x/socialite)
- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [Azure AD OAuth 2.0](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)
- [Laravel Sanctum Documentation](https://laravel.com/docs/10.x/sanctum)

## ✅ Checklist de Configuración

- [ ] Crear App Registration en Azure AD
- [ ] Copiar Client ID
- [ ] Crear y copiar Client Secret
- [ ] Configurar Redirect URI en Azure
- [ ] Agregar variables en .env backend
- [ ] Probar login con Microsoft
- [ ] Probar login tradicional
- [ ] Probar registro de usuarios
- [ ] Configurar guards en frontend
- [ ] Proteger rutas con AuthGuard
- [ ] Probar logout
- [ ] Probar refresh token

---

**Última actualización**: Marzo 2025  
**Versión**: 1.0.0
