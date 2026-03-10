# Guía para Cambiar Iconos y Logos de la Aplicación

## 📱 Iconos de la Aplicación Móvil (Android)

### Ubicación de los Iconos

Los iconos de Android están en:

```
frontend/android/app/src/main/res/
```

### Estructura de Carpetas para Iconos

```
res/
├── mipmap-mdpi/          # 48x48 px
│   ├── ic_launcher.png
│   └── ic_launcher_round.png
├── mipmap-hdpi/          # 72x72 px
│   ├── ic_launcher.png
│   └── ic_launcher_round.png
├── mipmap-xhdpi/         # 96x96 px
│   ├── ic_launcher.png
│   └── ic_launcher_round.png
├── mipmap-xxhdpi/        # 144x144 px
│   ├── ic_launcher.png
│   └── ic_launcher_round.png
└── mipmap-xxxhdpi/       # 192x192 px
    ├── ic_launcher.png
    └── ic_launcher_round.png
```

### Pasos para Cambiar el Icono

#### Opción 1: Herramienta Automática (Recomendada)

1. **Preparar tu logo:**

   - Formato: PNG con fondo transparente
   - Tamaño mínimo recomendado: **1024x1024 px**
   - Nombre sugerido: `logo.png`

2. **Usar Android Studio (si lo tienes instalado):**

   - Click derecho en `android/app/res`
   - New → Image Asset
   - Seleccionar tu logo
   - Genera automáticamente todos los tamaños

3. **Usar herramienta online:**
   - Visita: https://icon.kitchen/
   - O: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
   - Sube tu logo
   - Descarga el paquete ZIP
   - Extrae y copia las carpetas `mipmap-*` a `frontend/android/app/src/main/res/`

#### Opción 2: Manual

1. **Crear las diferentes resoluciones:**

   - **mdpi**: 48x48 px
   - **hdpi**: 72x72 px
   - **xhdpi**: 96x96 px
   - **xxhdpi**: 144x144 px
   - **xxxhdpi**: 192x192 px

2. **Reemplazar archivos:**

   ```bash
   # Desde la carpeta frontend/android/app/src/main/res/
   # Reemplaza ic_launcher.png en cada carpeta mipmap-*
   ```

3. **Sincronizar con Capacitor:**
   ```powershell
   cd c:\laragon\www\alquiler_jabas_parihuelas\frontend
   npx cap sync android
   ```

---

## 🌐 Favicon y Logo Web

### Favicon (Ícono del navegador)

**Ubicación:**

```
frontend/src/assets/icon/favicon.png
```

**Especificaciones:**

- Tamaño: 32x32 px o 64x64 px
- Formato: PNG (preferido) o ICO

**Cómo cambiar:**

1. Reemplaza `frontend/src/assets/icon/favicon.png` con tu nuevo ícono
2. Verifica que esté referenciado en `frontend/src/index.html`:
   ```html
   <link rel="icon" type="image/png" href="assets/icon/favicon.png" />
   ```

### Logo en la Web

**Ubicaciones comunes:**

1. **Logo del Header/Toolbar:**

   - Ubicación: `frontend/src/assets/logo.png` (o similar)
   - Referenciado en: `frontend/src/app/app.component.html` o componentes específicos
   - Tamaño recomendado: 200x50 px (ajustable según diseño)

2. **Logo en Login:**

   - Ubicación: `frontend/src/app/pages/login/login.page.html`
   - Actualizar el `<img src="...">`

3. **Splash Screen (Pantalla de carga):**
   - Editar: `frontend/src/assets/icon/splash.png`
   - Tamaño: 2732x2732 px (para adaptarse a todas las pantallas)

**Ejemplo de uso en HTML:**

```html
<ion-header>
  <ion-toolbar>
    <img src="assets/logo.png" alt="Logo" style="height: 40px;" />
    <ion-title>Jabas y Parihuelas</ion-title>
  </ion-toolbar>
</ion-header>
```

---

## 🎨 Splash Screen (Pantalla de Carga)

### Android

**Ubicación:**

```
frontend/android/app/src/main/res/drawable/splash.png
```

**Especificaciones:**

- Tamaño: 2732x2732 px (se escala automáticamente)
- Formato: PNG con transparencia
- El logo debe estar centrado con espacio alrededor

**Cómo cambiar:**

1. Crea una imagen 2732x2732 px con fondo (color definido en `capacitor.config.ts`)
2. Coloca tu logo centrado
3. Guarda como `splash.png`
4. Reemplaza `frontend/android/app/src/main/res/drawable/splash.png`
5. Sincroniza:
   ```powershell
   npx cap sync android
   ```

**Configurar color de fondo:**

Edita `frontend/capacitor.config.ts`:

```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,
    backgroundColor: '#568BA5', // ← Cambia este color
    showSpinner: false,
  },
}
```

---

## 📋 Checklist de Archivos a Reemplazar

### Para Móvil (Android):

- [ ] `frontend/android/app/src/main/res/mipmap-mdpi/ic_launcher.png` (48x48)
- [ ] `frontend/android/app/src/main/res/mipmap-hdpi/ic_launcher.png` (72x72)
- [ ] `frontend/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` (96x96)
- [ ] `frontend/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` (144x144)
- [ ] `frontend/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (192x192)
- [ ] `frontend/android/app/src/main/res/drawable/splash.png` (2732x2732)

### Para Web:

- [ ] `frontend/src/assets/icon/favicon.png` (32x32 o 64x64)
- [ ] `frontend/src/assets/logo.png` (tamaño variable, ej: 200x50)
- [ ] `frontend/src/assets/icon/splash.png` (2732x2732)

---

## 🛠️ Comandos para Aplicar Cambios

### Después de cambiar iconos:

```powershell
# 1. Sincronizar con Capacitor
cd c:\laragon\www\alquiler_jabas_parihuelas\frontend
npx cap sync android

# 2. Reconstruir la app
npm run build -- --configuration=mobile

# 3. Copiar al proyecto Android
npx cap copy android

# 4. Compilar APK
cd android
.\gradlew assembleRelease
```

---

## 🎯 Herramientas Recomendadas

### Generadores de Iconos:

- **Icon Kitchen**: https://icon.kitchen/ (muy completo, genera adaptive icons)
- **Android Asset Studio**: https://romannurik.github.io/AndroidAssetStudio/
- **MakeAppIcon**: https://makeappicon.com/
- **AppIcon**: https://www.appicon.co/

### Editores de Imágenes:

- **GIMP** (gratuito): https://www.gimp.org/
- **Photopea** (online gratuito): https://www.photopea.com/
- **Canva** (online con plantillas): https://www.canva.com/

### Redimensionar imágenes rápido:

- **Bulk Resize Photos**: https://bulkresizephotos.com/
- **ILoveIMG**: https://www.iloveimg.com/es/redimensionar-imagen

---

## 📝 Notas Importantes

1. **Formato PNG con transparencia** es lo más recomendado para iconos de apps
2. **No uses JPG** para iconos, puede verse mal en fondos claros/oscuros
3. **Deja margen** alrededor del logo en el icono (no pegado a los bordes)
4. **Prueba en diferentes fondos** (claro y oscuro) antes de finalizar
5. **El Splash Screen debe coincidir** con el color de fondo definido en `capacitor.config.ts`

---

## 🚀 Ejemplo Completo

```powershell
# 1. Prepara tu logo (1024x1024 px, PNG transparente)

# 2. Genera iconos en https://icon.kitchen/
#    - Sube logo.png
#    - Descarga ZIP

# 3. Extrae y copia a:
#    frontend/android/app/src/main/res/

# 4. Crea splash screen (2732x2732 px) y guarda en:
#    frontend/android/app/src/main/res/drawable/splash.png

# 5. Actualiza favicon web:
#    frontend/src/assets/icon/favicon.png (32x32 px)

# 6. Sincroniza y compila:
cd c:\laragon\www\alquiler_jabas_parihuelas\frontend
npx cap sync android
npm run build -- --configuration=mobile
cd android
.\gradlew assembleRelease
```

---

**¡Listo!** Tu app tendrá los nuevos iconos y logos tanto en móvil como en web. 🎉
