<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AppVersionController extends Controller
{
    /**
     * Obtener la versión actual de la app
     */
    public function getCurrentVersion()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'version' => '1.2.12', // Actualiza esto cada vez que publiques una nueva versión
                'versionCode' => 12, // Incrementa esto en cada release
                'downloadUrl' => env('FRONTEND_URL', 'https://apps.vanguardfresh.pe/jabas_y_parihuelas') . '/app-release.apk',
                'forceUpdate' => false, // Cambia a true si es una actualización crítica
                //frontend\android\app\build.gradle tambien debe cambiar en versionCode y versionName
                'releaseNotes' => [
                    'Mejoras en la estabilidad de la aplicación.',
                    'Corrección de errores menores.',
                    'Optimización del rendimiento.',
                ],
            ],
        ]);
    }
}
