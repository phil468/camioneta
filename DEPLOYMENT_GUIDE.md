# 🚀 Guía de Despliegue a Producción

## 📋 Pre-requisitos

### Servidor Requerido

- **PHP**: 8.1 o superior
- **MySQL**: 8.0 o superior
- **Node.js**: 20.19+ (para compilar el frontend)
- **Composer**: 2.x
- **Servidor web**: Apache o Nginx
- **SSL**: Certificado SSL válido (obligatorio para SSO Microsoft)

---

## 1️⃣ BACKEND (Laravel API)

### Paso 1: Preparar el servidor

```bash
# Instalar dependencias del sistema (Ubuntu/Debian)
sudo apt update
sudo apt install php8.1 php8.1-fpm php8.1-mysql php8.1-mbstring php8.1-xml php8.1-curl php8.1-zip php8.1-gd
sudo apt install mysql-server nginx composer
```

### Paso 2: Subir el código

```bash
# En tu servidor, clona el repositorio o sube los archivos
cd /var/www/
git clone https://github.com/phil468/alquiler_jabas_parihuelas.git
cd alquiler_jabas_parihuelas/backend
```

### Paso 3: Configurar el .env de producción

**IMPORTANTE**: Elimina la ruta temporal de debug de `api.php`:

```php
// En backend/routes/api.php - ELIMINAR ESTAS LÍNEAS:
// RUTA TEMPORAL PARA DEBUG - ELIMINAR EN PRODUCCIÓN
Route::get('generate-token/{userId}', function ($userId) {
    // ... código de debug
});
```

Crear `.env` basado en el ejemplo:

```bash
cp .env.example .env
nano .env
```

**Configuración de producción (.env):**

```env
APP_NAME="Control de Alquiler de Jabas y Parihuelas"
APP_ENV=production
APP_KEY=base64:AB923TjOl68z9QPeG7ejgbtwGemPmYpbxOr37qWC3cM=
APP_DEBUG=false  # ⚠️ IMPORTANTE: false en producción
APP_URL=https://tudominio.com

FRONTEND_URL=https://app.tudominio.com

LOG_CHANNEL=stack
LOG_LEVEL=error  # Solo errores en producción

DB_CONNECTION=mysql
DB_HOST=127.0.0.1  # O la IP de tu servidor MySQL
DB_PORT=3306
DB_DATABASE=alquiler_jabas_parihuelas_prod
DB_USERNAME=tu_usuario_mysql
DB_PASSWORD=tu_contraseña_segura

# Microsoft OAuth - Actualizar con URLs de producción
MICROSOFT_CLIENT_ID=f37bf8c2-0606-48fe-9003-dc64a2fb15bb
MICROSOFT_CLIENT_SECRET=Yy-8Q~QLNQl-fEUKgJM4GONucIcWVREFBU47cavQ
MICROSOFT_REDIRECT_URI=https://tudominio.com/api/v1/auth/microsoft/callback

# Cache en producción (recomendado)
CACHE_DRIVER=redis  # O file si no tienes Redis
SESSION_DRIVER=redis  # O database
QUEUE_CONNECTION=database  # Para procesamiento en segundo plano
```

### Paso 4: Instalar dependencias y configurar

```bash
# Instalar dependencias de Composer (sin dev)
composer install --optimize-autoloader --no-dev

# Generar clave de aplicación (si es nueva instalación)
php artisan key:generate

# Crear base de datos
mysql -u root -p
CREATE DATABASE alquiler_jabas_parihuelas_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# Ejecutar migraciones
php artisan migrate --force

# Ejecutar seeders (SOLO si quieres datos de ejemplo)
php artisan db:seed --force

# Crear enlace simbólico para storage
php artisan storage:link

# Optimizar para producción
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Paso 5: Configurar permisos

```bash
# Dar permisos a storage y bootstrap/cache
sudo chown -R www-data:www-data /var/www/alquiler_jabas_parihuelas/backend
sudo chmod -R 775 /var/www/alquiler_jabas_parihuelas/backend/storage
sudo chmod -R 775 /var/www/alquiler_jabas_parihuelas/backend/bootstrap/cache
```

### Paso 6: Configurar Nginx

Crear archivo `/etc/nginx/sites-available/alquiler-api`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name tudominio.com;

    # Redirigir a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name tudominio.com;
    root /var/www/alquiler_jabas_parihuelas/backend/public;

    # Certificados SSL
    ssl_certificate /etc/ssl/certs/tudominio.crt;
    ssl_certificate_key /etc/ssl/private/tudominio.key;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Activar el sitio:

```bash
sudo ln -s /etc/nginx/sites-available/alquiler-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Paso 7: Actualizar Azure AD (Microsoft OAuth)

1. Ve a [Azure Portal](https://portal.azure.com)
2. Azure Active Directory → App registrations → Tu app
3. **Authentication** → Redirect URIs:
   - Agregar: `https://tudominio.com/api/v1/auth/microsoft/callback`
   - Quitar el localhost
4. **API permissions** → Verificar permisos

---

## 2️⃣ FRONTEND (Ionic/Angular)

### Paso 1: Actualizar environment de producción

Editar `frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: "https://tudominio.com/api/v1",
};
```

### Paso 2: Compilar para producción

```bash
cd frontend

# Instalar dependencias
npm install

# Build para producción
npm run build -- --configuration production

# Esto genera archivos en: frontend/www/
```

### Paso 3: Desplegar el frontend

**Opción A: Hosting estático (Netlify, Vercel, AWS S3)**

```bash
# Los archivos compilados están en frontend/www/
# Subir esa carpeta a tu servicio de hosting
```

**Opción B: Mismo servidor con Nginx**

Crear archivo `/etc/nginx/sites-available/alquiler-frontend`:

```nginx
server {
    listen 80;
    server_name app.tudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.tudominio.com;
    root /var/www/alquiler_jabas_parihuelas/frontend/www;

    ssl_certificate /etc/ssl/certs/app.tudominio.crt;
    ssl_certificate_key /etc/ssl/private/app.tudominio.key;

    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache estático
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Activar:

```bash
sudo ln -s /etc/nginx/sites-available/alquiler-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 3️⃣ APP MÓVIL (Capacitor)

### Android

```bash
cd frontend

# Agregar plataforma Android (si no existe)
npx cap add android

# Sincronizar assets
npx cap sync android

# Abrir en Android Studio
npx cap open android
```

En Android Studio:

1. Build → Generate Signed Bundle / APK
2. Crear keystore (guardar en lugar seguro)
3. Compilar release APK o AAB
4. Subir a Google Play Console

### iOS

```bash
cd frontend

# Agregar plataforma iOS (requiere Mac)
npx cap add ios

# Sincronizar
npx cap sync ios

# Abrir en Xcode
npx cap open ios
```

En Xcode:

1. Configurar certificados de Apple Developer
2. Product → Archive
3. Distribuir a App Store Connect

---

## 4️⃣ SEGURIDAD

### ✅ Checklist de Seguridad

**Backend:**

- [ ] `APP_DEBUG=false`
- [ ] `APP_ENV=production`
- [ ] Contraseñas de BD seguras
- [ ] Eliminar rutas de debug de `api.php`
- [ ] Configurar CORS correctamente
- [ ] Habilitar rate limiting
- [ ] Configurar logs de errores
- [ ] SSL/HTTPS activo

**Frontend:**

- [ ] URLs de producción en environment
- [ ] Eliminar console.log de producción
- [ ] Habilitar source maps solo para debugging
- [ ] Configurar CSP headers

**Base de Datos:**

- [ ] Backups automáticos configurados
- [ ] Usuario MySQL sin privilegios de root
- [ ] Firewall solo permite conexiones locales a MySQL

---

## 5️⃣ MANTENIMIENTO

### Backups

**Base de datos (automatizar con cron):**

```bash
# Crear script backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u usuario -p'contraseña' alquiler_jabas_parihuelas_prod > /backups/db_$DATE.sql
# Mantener solo últimos 30 días
find /backups/ -name "db_*.sql" -mtime +30 -delete
```

**Archivos:**

```bash
# Backup de storage (PDFs, imágenes)
tar -czf /backups/storage_$DATE.tar.gz /var/www/alquiler_jabas_parihuelas/backend/storage/app
```

### Actualizaciones

```bash
# En el servidor
cd /var/www/alquiler_jabas_parihuelas/backend

# Modo mantenimiento
php artisan down

# Actualizar código
git pull origin main

# Actualizar dependencias
composer install --optimize-autoloader --no-dev

# Ejecutar migraciones
php artisan migrate --force

# Limpiar y regenerar cachés
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Salir de mantenimiento
php artisan up
```

---

## 6️⃣ MONITOREO

### Logs

**Backend (Laravel):**

```bash
# Ver logs en tiempo real
tail -f storage/logs/laravel.log
```

**Nginx:**

```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Herramientas recomendadas

- **Laravel Telescope** (desarrollo)
- **Sentry** (monitoreo de errores)
- **New Relic / Datadog** (performance)
- **UptimeRobot** (verificar uptime)

---

## 📝 Notas Importantes

1. **SSL es OBLIGATORIO**: Microsoft OAuth requiere HTTPS
2. **CORS**: Verifica que `backend/config/cors.php` permita tu dominio frontend
3. **Sanctum**: Asegúrate que `SANCTUM_STATEFUL_DOMAINS` incluya tu dominio
4. **Tokens**: Los tokens de debug generados manualmente NO funcionarán en producción
5. **Email**: Configura un servicio SMTP real (no Mailpit) para notificaciones

---

## 🆘 Troubleshooting

### Error 500

```bash
# Ver logs detallados
cat storage/logs/laravel.log
# Verificar permisos
sudo chown -R www-data:www-data storage bootstrap/cache
```

### CORS errors

```bash
# Verificar config/cors.php
php artisan config:clear
php artisan cache:clear
```

### Login Microsoft no funciona

- Verificar que HTTPS esté activo
- Verificar Redirect URI en Azure AD
- Verificar `.env` tiene URLs correctas

---

## ✅ Lista Final

- [ ] Backend desplegado con HTTPS
- [ ] Frontend desplegado
- [ ] Base de datos migrada y funcionando
- [ ] Microsoft OAuth configurado con URLs de producción
- [ ] Backups automáticos configurados
- [ ] Monitoreo de errores activo
- [ ] Documentación actualizada
- [ ] Crear usuario administrador inicial
- [ ] Probar flujo completo de registro → login → CRUD

---

**¡Listo para producción! 🎉**
