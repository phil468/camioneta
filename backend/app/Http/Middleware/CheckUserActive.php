<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserActive
{
    /**
     * Handle an incoming request.
     *
     * Verifica que el usuario autenticado esté activo.
     * Si el usuario está inactivo o eliminado, cierra la sesión automáticamente.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Verificar si hay un usuario autenticado
        if (Auth::check()) {
            $user = Auth::user();
            
            // Si el usuario no está activo, cerrar sesión y devolver error
            if (!$user->activo) {
                // Revocar el token actual (si usa Sanctum)
                if ($request->user()) {
                    $request->user()->currentAccessToken()->delete();
                }
                
                return response()->json([
                    'success' => false,
                    'message' => 'Tu cuenta ha sido desactivada. Contacta al administrador.',
                    'logout' => true
                ], 403);
            }
        }

        return $next($request);
    }
}
