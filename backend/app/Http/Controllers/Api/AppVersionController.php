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
        $frontendBaseUrl = rtrim(env('FRONTEND_URL', 'https://apps.vanguardfresh.pe/camioneta_app'), '/');
        $downloadUrl = env('APP_DOWNLOAD_URL', $frontendBaseUrl . '/app-release-1-1-8.apk');

        return response()->json([
            'success' => true,
            'data' => [
                'version' => '1.1.8', // Actualiza esto cada vez que publiques una nueva versión
                'versionCode' => 8, // Incrementa esto en cada release
                'downloadUrl' => $downloadUrl,
                'forceUpdate' => false, // Cambia a true si es una actualización crítica
                //frontend\android\app\build.gradle tambien debe cambiar en versionCode y versionName
                'releaseNotes' => [
                    //ultimos cambios en git log --oneline -n 5
                    'Mejora para eliminar mi reserva',
                    'Mejoras en la interfaz de usuario',
                    'Mejora en la actualización de la aplicación'
                ],
            ],
        ]);
    }
}
