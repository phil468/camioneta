<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\AppVersionController;
use App\Http\Controllers\Api\CamionetaController;
use App\Http\Controllers\Api\ChecklistItemController;
use App\Http\Controllers\Api\ReservaController;
use App\Http\Controllers\Api\UsoCamionetaController;
use App\Http\Controllers\Api\AuditoriaController;

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
    Route::post('exchange-code', [AuthController::class, 'exchangeAuthCode']);
});

// Rutas protegidas de autenticación
Route::middleware(['auth:sanctum', 'user.active'])->prefix('v1/auth')->group(function () {
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('refresh', [AuthController::class, 'refresh']);
});

// Rutas protegidas con autenticación
Route::middleware(['auth:sanctum', 'user.active'])->prefix('v1')->group(function () {
    
    // === CAMIONETAS (mantenimiento) ===
    Route::apiResource('camionetas', CamionetaController::class);
    Route::get('opciones/camionetas', [CamionetaController::class, 'activas']);

    // === CHECKLIST ITEMS (mantenimiento) ===
    Route::apiResource('checklist-items', ChecklistItemController::class);
    Route::get('opciones/checklist-items', [ChecklistItemController::class, 'activos']);

    // === RESERVAS ===
    Route::apiResource('reservas', ReservaController::class);
    Route::get('reservas-slots/ocupados', [ReservaController::class, 'slotsOcupados']);

    // === USO DE CAMIONETA ===
    Route::apiResource('usos-camioneta', UsoCamionetaController::class);
    Route::post('usos-camioneta/{id}/finalizar', [UsoCamionetaController::class, 'finalizar']);
    Route::post('usos-camioneta/{usoId}/checklist/{respuestaId}/foto', [UsoCamionetaController::class, 'subirFotoChecklist']);

    // === USUARIOS ===
    Route::apiResource('usuarios', UserController::class);
    Route::get('opciones/usuarios', [UserController::class, 'activos']);
    Route::get('roles', [RoleController::class, 'index']);
    Route::get('roles/{id}', [RoleController::class, 'show']);

    // === AUDITORÍA ===
    Route::get('auditoria', [AuditoriaController::class, 'index']);
    Route::get('auditoria/{id}', [AuditoriaController::class, 'show']);
});
