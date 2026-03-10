# Configuración de Microsoft SSO para App Móvil

## 🔧 Problema Actual

Cuando inicias sesión con Microsoft en la app móvil, te redirige al navegador web en lugar de volver a la app.

## ✅ Solución Implementada

### Cambios Realizados:

#### 1. **Backend** (`AuthController.php`)

- ✅ Detecta si viene desde móvil usando header `X-Mobile-App`
- ✅ Redirige usando deep link scheme: `jabasyparihuelas://auth-callback?token=...`
- ✅ Maneja errores con deep links también

#### 2. **Frontend** (`auth.service.ts`)

- ✅ Importa plugins `@capacitor/browser` y `@capacitor/app`
- ✅ Abre OAuth en browser in-app con `Browser.open()`
- ✅ Escucha deep links con `App.addListener('appUrlOpen')`
- ✅ Cierra el browser automáticamente con `Browser.close()`
- ✅ Procesa token y redirige a home

#### 3. **Android** (`AndroidManifest.xml`)

- ✅ Agregado intent-filter para deep links `jabasyparihuelas://`

---

## 🚀 Pasos Finales para que Funcione

### 1. Instalar Plugins de Capacitor

```powershell
cd c:\laragon\www\alquiler_jabas_parihuelas\frontend
npm install @capacitor/browser @capacitor/app
```

### 2. Configurar Azure AD (Microsoft)

Debes agregar el **Custom URL Scheme** en tu configuración de Azure:

**Paso a paso:**

1. Ve a https://portal.azure.com/
2. Azure Active Directory → App Registrations
3. Selecciona tu app "Jabas y Parihuelas"
4. Ve a **Authentication** (Autenticación)
5. En **Platform configurations**, agrega:
   - Platform: **Mobile and desktop applications**
   - Custom redirect URIs:
     ```
     jabasyparihuelas://auth-callback
     ```
6. **Guarda los cambios**

### 3. Actualizar .env del Backend

Agrega la URL de producción para móvil:

```env
# .env
MICROSOFT_REDIRECT_URI=https://apps.vanguardfresh.pe/jabasyparihuelas/api/v1/auth/microsoft/callback
FRONTEND_URL=https://apps.vanguardfresh.pe/jabas_y_parihuelas
```

**Nota:** El backend detectará si viene desde móvil y usará el deep link automáticamente.

### 4. Sincronizar y Compilar

```powershell
# Sincronizar plugins con Android
cd c:\laragon\www\alquiler_jabas_parihuelas\frontend
npx cap sync android

# Construir app para móvil
npm run build -- --configuration=mobile

# Copiar al proyecto Android
npx cap copy android

# Compilar APK
cd android
.\gradlew assembleRelease
```

---

## 🔍 Cómo Funciona el Flujo

### Flujo en Web:

1. Usuario hace clic en "Iniciar sesión con Microsoft"
2. Redirect a Microsoft OAuth
3. Microsoft redirige a: `https://apps.vanguardfresh.pe/.../auth/callback?token=...`
4. Frontend procesa y redirige a `/home`

### Flujo en Móvil:

1. Usuario hace clic en "Iniciar sesión con Microsoft"
2. Se abre browser in-app con OAuth de Microsoft
3. Después de login, Microsoft redirige al backend
4. **Backend detecta móvil** y redirige a: `jabasyparihuelas://auth-callback?token=...`
5. **Android intercepta el deep link** (gracias al intent-filter)
6. **App captura el URL** con `App.addListener('appUrlOpen')`
7. **Browser se cierra** automáticamente con `Browser.close()`
8. **AuthService procesa** el token y datos del usuario
9. **Redirige a** `/home` dentro de la app

---

## 🐛 Troubleshooting

### Problema: El browser no se cierra automáticamente

**Solución:**
Verifica que tienes instalado `@capacitor/browser`:

```powershell
npm install @capacitor/browser
npx cap sync android
```

### Problema: No intercepta el deep link

**Causas posibles:**

1. No ejecutaste `npx cap sync android` después de modificar `AndroidManifest.xml`
2. El scheme no coincide (debe ser `jabasyparihuelas://`)
3. Necesitas reinstalar la app en el dispositivo

**Solución:**

```powershell
# Sincronizar y reinstalar
npx cap sync android
cd android
.\gradlew assembleRelease

# Desinstala la app del dispositivo
# Reinstala el APK nuevo
```

### Problema: Microsoft no acepta el deep link

**Solución:**
En Azure AD, verifica que agregaste:

```
jabasyparihuelas://auth-callback
```

En **Authentication → Mobile and desktop applications → Custom redirect URIs**

### Problema: Backend no detecta que es móvil

**Causa:**
El header `X-Mobile-App` no se está enviando.

**Solución temporal:**
Puedes detectar por el User-Agent. Modifica `AuthController.php`:

```php
// Detectar si viene desde móvil
$userAgent = $request->header('User-Agent', '');
$isMobile = $request->header('X-Mobile-App') === 'true' ||
            stripos($userAgent, 'android') !== false ||
            stripos($userAgent, 'capacitor') !== false;
```

---

## 📱 Alternativa: OAuth Nativo (Más Complejo pero Mejor)

Si el deep link sigue dando problemas, puedes implementar OAuth completamente nativo usando:

### Opción 1: Capacitor OAuth2 Plugin

```powershell
npm install @byteowls/capacitor-oauth2
```

### Opción 2: Microsoft MSAL para Capacitor

```powershell
npm install @azure/msal-browser
```

Esto evita abrir el browser y todo se maneja dentro de la app, pero requiere más configuración.

---

## ✅ Checklist de Verificación

Antes de probar en el dispositivo:

- [ ] Plugins instalados: `@capacitor/browser` y `@capacitor/app`
- [ ] `npx cap sync android` ejecutado
- [ ] `AndroidManifest.xml` tiene el intent-filter
- [ ] Azure AD tiene configurado `jabasyparihuelas://auth-callback`
- [ ] Backend tiene el código de detección de móvil
- [ ] App compilada con configuración `mobile` (no `production`)
- [ ] APK reinstalado en el dispositivo

---

## 🎯 Próximos Pasos

1. **Actualiza Node.js** a v20.19+ (necesario para compilar)
2. **Ejecuta los comandos** de sincronización y compilación
3. **Instala el APK** en tu dispositivo
4. **Prueba el login** con Microsoft
5. **Verifica** que el browser se cierre automáticamente y vuelva a la app

---

## 📞 Contacto para Soporte

Si después de seguir estos pasos sigue sin funcionar:

1. Revisa los logs de Android Studio con `adb logcat`
2. Verifica que el deep link se esté interceptando
3. Comprueba que el backend está recibiendo las peticiones

**Comando para ver logs:**

```powershell
adb logcat | Select-String "jabasyparihuelas"
```

Esto mostrará todos los logs relacionados con tu app y el deep link.
