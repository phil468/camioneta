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
                'version' => '1.1.5', // Actualiza esto cada vez que publiques una nueva versión
                'versionCode' => 5, // Incrementa esto en cada release
                'downloadUrl' => env('FRONTEND_URL', 'https://apps.vanguardfresh.pe/camioneta_app') . '/app-release.apk',
                'forceUpdate' => false, // Cambia a true si es una actualización crítica
                //frontend\android\app\build.gradle tambien debe cambiar en versionCode y versionName
                'releaseNotes' => [
                    'Optimizar carga de reservas en la página de camionetas',
                ],
            ],
        ]);
    }
}
