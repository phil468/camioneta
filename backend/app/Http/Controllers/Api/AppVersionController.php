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
                'version' => '1.1.6', // Actualiza esto cada vez que publiques una nueva versión
                'versionCode' => 6, // Incrementa esto en cada release
                'downloadUrl' => env('FRONTEND_URL', 'https://apps.vanguardfresh.pe/camioneta_app') . '/app-release.apk',
                'forceUpdate' => true, // Cambia a true si es una actualización crítica
                //frontend\android\app\build.gradle tambien debe cambiar en versionCode y versionName
                'releaseNotes' => [                    
                    'Se añade información emergente para mostrar los detalles de la reserva',
                    'Se implementa una protección contra el envío duplicado en uso de camioneta',
                    'Se refactoriza el método para gestionar la carga de archivos'
                ],
            ],
        ]);
    }
}
