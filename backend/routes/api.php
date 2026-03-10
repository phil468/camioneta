<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\RepresentanteClienteController;
use App\Http\Controllers\Api\ChoferController;
use App\Http\Controllers\Api\PlacaController;
use App\Http\Controllers\Api\DescripcionJabaController;
use App\Http\Controllers\Api\RegistroController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\AppVersionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Ruta pública para verificar versión de la app
Route::prefix('v1/app')->group(function () {
    Route::get('version', [AppVersionController::class, 'getCurrentVersion']);
});

// Rutas de autenticación (públicas)
Route::prefix('v1/auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    Route::get('microsoft', [AuthController::class, 'redirectToMicrosoft']);
    Route::get('microsoft/callback', [AuthController::class, 'handleMicrosoftCallback']);
});

// Rutas protegidas de autenticación
Route::middleware(['auth:sanctum', 'user.active'])->prefix('v1/auth')->group(function () {
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('refresh', [AuthController::class, 'refresh']);
});

// Rutas protegidas con autenticación (aplicar a todas las rutas de la API)
Route::middleware(['user.active'])->prefix('v1')->group(function () {
    
    // Tablas de mantenimiento
    Route::apiResource('clientes', ClienteController::class);
    Route::apiResource('representantes-clientes', RepresentanteClienteController::class);
    Route::post('representantes-clientes/{id}/activar', [RepresentanteClienteController::class, 'activar']);
    Route::apiResource('choferes', ChoferController::class);
    Route::apiResource('placas', PlacaController::class);
    Route::apiResource('descripciones-jabas', DescripcionJabaController::class);
    Route::apiResource('usuarios', UserController::class);
    Route::get('roles', [RoleController::class, 'index']);
    Route::get('roles/{id}', [RoleController::class, 'show']);
    
    // Registros principales
    Route::apiResource('registros', RegistroController::class);
    
    // Rutas adicionales para registros
    Route::post('registros/{id}/cambiar-estado', [RegistroController::class, 'cambiarEstado']);
    Route::post('registros/{id}/adjuntar-pdf', [RegistroController::class, 'adjuntarPdf']);
    Route::get('registros/{id}/generar-pdf', [RegistroController::class, 'generarPdf']);
    Route::get('registros/{id}/descargar-guia', [RegistroController::class, 'descargarGuia']);
    Route::get('registros/exportar/excel', [RegistroController::class, 'exportarExcel']);
    Route::get('registros/exportar/excel', [RegistroController::class, 'exportarExcel']);
    
    // Rutas de importación masiva
    Route::post('choferes/import', [ChoferController::class, 'import']);
    Route::post('descripciones-jabas/import', [DescripcionJabaController::class, 'import']);
    
    // Ruta para obtener opciones activas (para dropdowns)
    Route::get('opciones/clientes', [ClienteController::class, 'activos']);
    Route::get('opciones/choferes', [ChoferController::class, 'activos']);
    Route::get('opciones/placas', [PlacaController::class, 'activas']);
    Route::get('opciones/descripciones-jabas', [DescripcionJabaController::class, 'activas']);
    Route::get('opciones/usuarios', [UserController::class, 'activos']);

    // Dashboard y estadísticas
    Route::get('dashboard/estadisticas', [DashboardController::class, 'getEstadisticas']);
    Route::get('dashboard/tendencias', [DashboardController::class, 'getTendencias']);
});
