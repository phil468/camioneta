# 📱 Guía Rápida para Compilar APK

## 🚀 Comandos Rápidos

### Compilación Completa (desde cero)

```powershell
cd c:\laragon\www\camioneta\frontend

# 1. Limpiar (opcional, solo si hay problemas)
# Remove-Item -Recurse -Force www

# 2. Construir para móvil (requiere Node.js 20.19+)
npm run build -- --configuration=mobile

# 3. Sincronizar con Capacitor
npx cap sync android

# 4. Copiar assets
npx cap copy android

# 5. Compilar APK Debug
cd android
.\gradlew assembleDebug

# 6. APK resultante está en:
# android\app\build\outputs\apk\debug\app-debug.apk
```

### Compilación Rápida (si solo cambiaste código TypeScript)

```powershell
cd c:\laragon\www\camioneta\frontend

# Solo rebuild y sync
npm run build -- --configuration=mobile
npx cap copy android
cd android
.\gradlew assembleDebug
```

### Compilación APK Release (para producción)

```powershell
cd c:\laragon\www\alquiler_jabas_parihuelas\frontend

npm run build -- --configuration=mobile
npx cap copy android
cd android

# Asegúrate de tener configurado key.properties con tus credenciales del keystore
.\gradlew assembleRelease

# APK firmado está en:
# android\app\build\outputs\apk\release\app-release.apk
```

---

## 📦 Instalar APK en Dispositivo

### Opción 1: Copiar Manualmente

1. Copia `app-debug.apk` a tu teléfono (USB, email, Drive)
2. Abre el archivo en el teléfono
3. Permite instalar desde fuentes desconocidas si te lo pide
4. Instala

### Opción 2: Usar ADB (si está instalado)

```powershell
# Ubicar el APK
cd c:\laragon\www\alquiler_jabas_parihuelas\frontend\android

# Instalar (reemplaza la versión anterior)
adb install -r app\build\outputs\apk\debug\app-debug.apk

# Ver logs en tiempo real
adb logcat | Select-String "jabasyparihuelas"
```

### Opción 3: Android Studio

1. Abre `frontend/android` en Android Studio
2. Click en Run ▶️ (Shift + F10)
3. Selecciona tu dispositivo

---

## ⚠️ Problemas Comunes

### "Node.js version v20.9.0 detected"

**Solución:** Actualiza Node.js a v20.19+ desde https://nodejs.org/

### "adb: command not found"

**Solución:**

- Instala Android SDK Platform Tools
- O copia el APK manualmente

### "Execution failed for task ':app:mergeDebugResources'"

**Solución:**

```powershell
cd android
.\gradlew clean
.\gradlew assembleDebug
```

### Cambios no se reflejan en la app

**Solución:**

```powershell
# Asegúrate de ejecutar TODOS estos pasos:
npm run build -- --configuration=mobile
npx cap copy android
cd android
.\gradlew assembleDebug

# Luego DESINSTALA la app del teléfono e instala el nuevo APK
```

---

## 🔧 Variables de Entorno

Asegúrate de que `frontend/src/environments/environment.prod.ts` tenga:

```typescript
export const environment = {
  production: true,
  apiUrl: "https://apps.vanguardfresh.pe/jabasyparihuelas/api/v1",
};
```

---

## 📝 Notas

- **Debug APK**: Sin firmar, solo para pruebas
- **Release APK**: Firmado, listo para publicar en Play Store
- **Configuración mobile**: Usa `baseHref: "/"` (sin subdirectorio)
- **Configuración production**: Usa `baseHref: "/jabas_y_parihuelas/"` (para web)

---

## ✅ Checklist Antes de Compilar

- [ ] Backend corriendo y accesible
- [ ] Node.js versión 20.19+ instalada
- [ ] Cambios guardados en todos los archivos
- [ ] `npm install` ejecutado si agregaste nuevas dependencias
- [ ] Dispositivo Android conectado (para pruebas)

---

## 🎯 Próximo Paso

Después de instalar el APK, prueba:

1. Abrir la app
2. Click en "CONTINUAR CON MICROSOFT"
3. Inicia sesión
4. **El navegador debería cerrarse automáticamente**
5. Deberías volver a la app en la página Home

Si no funciona, revisa los logs con:

```powershell
adb logcat | Select-String "DeepLink|jabasyparihuelas|auth-callback"
```
