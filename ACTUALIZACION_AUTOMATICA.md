# Sistema de Verificación Automática de Versiones

## 📱 Funcionamiento

La app ahora **verifica automáticamente** si hay una nueva versión disponible cada vez que se abre.

### Cómo Funciona:

1. **Al abrir la app** (2 segundos después de cargar)
2. **Compara** la versión instalada con la versión en el servidor
3. **Muestra alerta** si hay una actualización disponible
4. **Botón de descarga** para obtener la nueva versión

---

## 🔧 Archivos Creados/Modificados

### Backend:

- ✅ `AppVersionController.php` - Controla la versión actual
- ✅ `routes/api.php` - Ruta pública `/api/v1/app/version`

### Frontend:

- ✅ `version-check.service.ts` - Servicio de verificación
- ✅ `app.component.ts` - Llama al verificador al iniciar
- ✅ `global.scss` - Estilos para la alerta

---

## 📝 Cómo Actualizar la Versión

### Cada vez que publiques una nueva versión:

#### 1. **Actualizar versión en Android** (`android/app/build.gradle`):

```gradle
defaultConfig {
    applicationId "pe.vanguardfresh.jabasyparihuelas"
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion
    versionCode 2        // ⬅️ INCREMENTAR ESTE NÚMERO
    versionName "1.1.0"  // ⬅️ CAMBIAR VERSIÓN SEMÁNTICA
    ...
}
```

**Importante:**

- `versionCode`: Incrementa en 1 cada release (1, 2, 3, 4...)
- `versionName`: Versión semántica (1.0.0, 1.1.0, 2.0.0...)

#### 2. **Actualizar versión en el backend** (`AppVersionController.php`):

```php
public function getCurrentVersion()
{
    return response()->json([
        'success' => true,
        'data' => [
            'version' => '1.1.0',        // ⬅️ IGUAL que versionName
            'versionCode' => 2,          // ⬅️ IGUAL que versionCode
            'downloadUrl' => env('APP_URL', 'https://apps.vanguardfresh.pe') . '/jabas_y_parihuelas/app-release.apk',
            'forceUpdate' => false,      // ⬅️ true si es crítico actualizar
            'releaseNotes' => [
                'Corrección de errores',
                'Mejoras de rendimiento',
                'Nueva función X',
            ],
        ],
    ]);
}
```

#### 3. **Compilar el nuevo APK**:

Antes de compilar release, configura la firma (una sola vez):

```powershell
cd c:\laragon\www\camioneta\frontend\android
copy key.properties.example key.properties
```

Edita `key.properties` con tus datos reales de keystore.

Si aun no tienes keystore, crea uno:

```powershell
cd c:\laragon\www\camioneta\frontend\android
keytool -genkeypair -v -keystore release-keystore.jks -alias release -keyalg RSA -keysize 2048 -validity 10000
```

```powershell
cd c:\laragon\www\camioneta\frontend
npm run build:apk
cd android
.\gradlew assembleRelease
```

Verificar firma del APK generado:

```powershell
cd c:\laragon\www\camioneta\frontend\android
apksigner verify --print-certs app\build\outputs\apk\release\app-release.apk
```

#### 4. **Subir el APK al servidor**:

```powershell
cd..
scp android/app/build/outputs/apk/release/app-release.apk john.delacruz@172.18.10.10:/var/www/camioneta/frontend/www/
```

---

cd c:\laragon\www\camioneta\frontend
npm run build:apk
cd android
.\gradlew assembleRelease
cd..
scp android/app/build/outputs/apk/release/app-release.apk john.delacruz@172.18.10.10:/var/www/camioneta/frontend/www/

npm run build:web
scp -r www/* john.delacruz@172.18.10.10:/var/www/camioneta/frontend/www/

## 🎯 Tipos de Actualización

### Actualización Normal (`forceUpdate: false`):

- Usuario puede posponer
- Botón "Más tarde" disponible
- Puede cerrar la alerta

### Actualización Forzada (`forceUpdate: true`):

- **NO se puede cerrar** la alerta
- Solo opción: "Actualizar ahora"
- Útil para correcciones críticas de seguridad

**Ejemplo de actualización forzada:**

```php
'forceUpdate' => true,  // Usuario DEBE actualizar
```

---

## 📋 Ejemplo de Flujo Completo

### Versión 1.0.0 → 1.1.0

1. **Modificar `build.gradle`**:

```gradle
versionCode 2
versionName "1.1.0"
```

2. **Modificar `AppVersionController.php`**:

```php
'version' => '1.1.0',
'versionCode' => 2,
'forceUpdate' => false,
'releaseNotes' => [
    'Agregado sistema de verificación de versiones',
    'Mejoras en el SSO de Microsoft',
    'Corrección de bugs en el formulario de registros',
],
```

3. **Compilar**:

```powershell
npm run build:apk
npx cap sync android
cd android
.\gradlew assembleRelease
```

4. **Subir**:

```powershell
scp android/app/build/outputs/apk/release/app-release.apk john.delacruz@172.18.10.10:/var/www/apps/jabas_y_parihuelas/
scp -r www/* john.delacruz@172.18.10.10:/var/www/jabasyparihuelas/frontend/www/

cd..
scp android/app/build/outputs/apk/release/app-release.apk john.delacruz@172.18.10.10:/var/www/jabasyparihuelas/frontend/www/
```

5. **Listo**: Los usuarios verán la alerta al abrir la app

---

## 🧪 Cómo Probar

### Opción 1: Cambiar manualmente el versionCode

En `build.gradle` pon un número MUY ALTO:

```gradle
versionCode 999
```

Compila e instala. Luego en el servidor pon:

```php
'versionCode' => 1000,
```

Al abrir la app verás la alerta.

### Opción 2: Usar versión antigua

Mantén la versión antigua instalada en el celular y actualiza el servidor con una versión nueva.

---

## ⚠️ Importante

### Siempre mantener sincronizados:

1. **`build.gradle`** → `versionCode` y `versionName`
2. **`AppVersionController.php`** → `version` y `versionCode`

### Si no coinciden:

- `versionCode` en servidor > app instalada = ✅ Alerta de actualización
- `versionCode` en servidor < app instalada = ❌ No muestra alerta
- `versionCode` iguales = ❌ No muestra alerta

---

## 🔔 Cuándo Usar Actualización Forzada

✅ **Usa `forceUpdate: true` cuando:**

- Corrección de seguridad crítica
- Error que impide usar funciones esenciales
- Cambio en la API que rompe compatibilidad
- Problema de pérdida de datos

❌ **NO uses `forceUpdate: true` para:**

- Nuevas funcionalidades menores
- Mejoras de UI
- Optimizaciones de rendimiento

---

## 📊 Versionado Semántico Recomendado

```
MAJOR.MINOR.PATCH
  1  .  0  .  0
```

- **MAJOR** (1.x.x): Cambios incompatibles en la API
- **MINOR** (x.1.x): Nuevas funcionalidades compatibles
- **PATCH** (x.x.1): Corrección de bugs

**Ejemplos:**

- `1.0.0` → `1.0.1`: Corrección de bug
- `1.0.1` → `1.1.0`: Nueva función
- `1.1.0` → `2.0.0`: Cambio incompatible

---

## 🚀 Checklist de Publicación

- [ ] Incrementar `versionCode` en `build.gradle`
- [ ] Actualizar `versionName` en `build.gradle`
- [ ] Actualizar `version` en `AppVersionController.php`
- [ ] Actualizar `versionCode` en `AppVersionController.php`
- [ ] Actualizar `releaseNotes` con los cambios
- [ ] Decidir si `forceUpdate` debe ser `true` o `false`
- [ ] Compilar APK con `.\gradlew assembleRelease`
- [ ] Subir APK al servidor
- [ ] Verificar permisos del archivo (644)
- [ ] Probar descarga desde el navegador
- [ ] Abrir la app y verificar que muestra la alerta

---

¡Listo! Ahora tu app verificará automáticamente actualizaciones cada vez que se abra. 🎉
