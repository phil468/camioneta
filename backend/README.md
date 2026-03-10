# Backend - Control de Alquiler de Jabas y Parihuelas<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

API RESTful construida con Laravel 10 para gestionar el alquiler de jabas y parihuelas.<p align="center">

<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>

## 🚀 Configuración Inicial<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>

<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>

### 1. Iniciar MySQL en Laragon<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>

1. Abrir Laragon</p>

2. Clic en "Start All"

3. Crear base de datos: `alquiler_jabas_parihuelas`## About Laravel

### 2. Ejecutar MigracionesLaravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

````bash

php artisan migrate- [Simple, fast routing engine](https://laravel.com/docs/routing).

```- [Powerful dependency injection container](https://laravel.com/docs/container).

- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.

### 3. Crear Storage Link- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).

```bash- Database agnostic [schema migrations](https://laravel.com/docs/migrations).

php artisan storage:link- [Robust background job processing](https://laravel.com/docs/queues).

```- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).



### 4. Iniciar ServidorLaravel is accessible, powerful, and provides tools required for large, robust applications.

```bash

php artisan serve## Learning Laravel

````

API disponible en: `http://localhost:8000/api/v1`Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

## 📡 Endpoints PrincipalesYou may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

### RegistrosIf you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

-   `GET /api/v1/registros` - Listar (con filtros)

-   `POST /api/v1/registros` - Crear## Laravel Sponsors

-   `POST /api/v1/registros/{id}/cambiar-estado` - Cambiar estado

-   `POST /api/v1/registros/{id}/adjuntar-pdf` - Adjuntar PDFWe would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Tablas de Mantenimiento### Premium Partners

-   `GET /api/v1/clientes` - Clientes

-   `GET /api/v1/choferes` - Choferes - **[Vehikl](https://vehikl.com/)**

-   `GET /api/v1/placas` - Placas- **[Tighten Co.](https://tighten.co)**

-   `GET /api/v1/descripciones-jabas` - Descripciones- **[WebReinvent](https://webreinvent.com/)**

-   **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**

### Opciones para Dropdowns- **[64 Robots](https://64robots.com)**

-   `GET /api/v1/opciones/clientes`- **[Curotec](https://www.curotec.com/services/technologies/laravel/)**

-   `GET /api/v1/opciones/choferes`- **[Cyber-Duck](https://cyber-duck.co.uk)**

-   `GET /api/v1/opciones/placas`- **[DevSquad](https://devsquad.com/hire-laravel-developers)**

-   `GET /api/v1/opciones/descripciones-jabas`- **[Jump24](https://jump24.co.uk)**

-   **[Redberry](https://redberry.international/laravel/)**

## 📊 Estructura de Datos- **[Active Logic](https://activelogic.com)**

-   **[byte5](https://byte5.de)**

Ver archivo completo de documentación en el README principal del proyecto.- **[OP.GG](https://op.gg)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
