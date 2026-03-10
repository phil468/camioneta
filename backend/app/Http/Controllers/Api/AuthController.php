<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use GuzzleHttp\Client;

class AuthController extends Controller
{
    /**
     * Get Guzzle client with SSL verification disabled for development
     */
    private function getGuzzleClient()
    {
        return new Client([
            'verify' => false, // Deshabilitar verificación SSL en desarrollo
        ]);
    }

    /**
     * Redirect to Microsoft OAuth
     */
    public function redirectToMicrosoft(Request $request)
    {
        $driver = Socialite::driver('microsoft')
            ->setHttpClient($this->getGuzzleClient())
            ->stateless();

        // Si la petición viene de la app móvil, pasar la info a través del state de OAuth
        if ($request->query('source') === 'mobile_app') {
            $driver->with(['state' => 'mobile_' . Str::random(40)]);
        }

        return $driver->redirect();
    }

    /**
     * Detecta si la petición viene desde la app móvil
     */
    private function isMobileApp(Request $request): bool
    {
        // Verificar header personalizado
        if ($request->header('X-Mobile-App') === 'true') {
            return true;
        }

        // Verificar User-Agent para Capacitor o navegadores móviles
        $userAgent = $request->header('User-Agent', '');
        if (
            stripos($userAgent, 'capacitor') !== false ||
            stripos($userAgent, 'jabasyparihuelas') !== false ||
            stripos($userAgent, 'android') !== false ||
            stripos($userAgent, 'iphone') !== false ||
            stripos($userAgent, 'mobile') !== false
        ) {
            return true;
        }

        return false;
    }

    /**
     * Handle Microsoft OAuth callback
     */
    public function handleMicrosoftCallback(Request $request)
    {
        // Detectar si viene desde móvil (state de OAuth o User-Agent)
        $state = $request->query('state', '');
        $isMobileFromState = str_starts_with($state, 'mobile_');
        $isMobile = $isMobileFromState || $this->isMobileApp($request);

        try {
            $microsoftUser = Socialite::driver('microsoft')
                ->setHttpClient($this->getGuzzleClient())
                ->stateless()
                ->user();

            // Verificar si el usuario existe en la base de datos
            $user = User::where('email', $microsoftUser->getEmail())->first();

            if (!$user) {
                $errorMessage = urlencode('Usuario no registrado en el sistema. Contacte al administrador.');
                
                if ($isMobile) {
                    return redirect()->to("jabasyparihuelas://login?error={$errorMessage}");
                } else {
                    $frontendUrl = env('FRONTEND_URL', 'http://localhost:8100');
                    return redirect()->to("{$frontendUrl}/login?error={$errorMessage}");
                }
            }

            // Verificar si el usuario está activo
            if (!$user->activo) {
                $errorMessage = urlencode('Usuario inactivo. Contacte al administrador.');
                
                if ($isMobile) {
                    return redirect()->to("jabasyparihuelas://login?error={$errorMessage}");
                } else {
                    $frontendUrl = env('FRONTEND_URL', 'http://localhost:8100');
                    return redirect()->to("{$frontendUrl}/login?error={$errorMessage}");
                }
            }

            // Obtener avatar de forma segura
            $avatarUrl = null;
            try {
                $avatarUrl = $microsoftUser->avatar ?? null;
            } catch (\Exception $e) {
                $avatarUrl = null;
            }

            // Actualizar microsoft_id y avatar si es necesario
            if (!$user->microsoft_id) {
                $user->microsoft_id = $microsoftUser->getId();
            }
            
            if (!$user->avatar && $avatarUrl) {
                $user->avatar = $avatarUrl;
            }
            
            $user->save();

            // Crear token de Sanctum
            $user->load('role');
            $token = $user->createToken('auth-token')->plainTextToken;

            // Preparar datos del usuario (usar base64 para compatibilidad)
            $userData = base64_encode(json_encode([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'role' => $user->role ? [
                    'id' => $user->role->id,
                    'nombre' => $user->role->nombre,
                    'slug' => $user->role->slug,
                    'permisos' => $user->role->permisos,
                ] : null,
            ]));

            // Redirigir según el contexto (web vs móvil)
            if ($isMobile) {
                // Usar deep link custom scheme para la app móvil
                // Con Chrome Custom Tabs, esto cerrará automáticamente el navegador
                $appScheme = 'jabasyparihuelas://auth-callback';
                return redirect()->to(
                    "{$appScheme}?token={$token}&user={$userData}"
                );
            } else {
                // Redirigir al frontend web
                $frontendUrl = env('FRONTEND_URL', 'http://localhost:8100');
                return redirect()->to(
                    "{$frontendUrl}/auth/callback?token={$token}&user={$userData}"
                );
            }

        } catch (\Exception $e) {
            $errorMessage = urlencode($e->getMessage());
            
            if ($isMobile) {
                $appScheme = 'jabasyparihuelas://login';
                return redirect()->to(
                    "{$appScheme}?error={$errorMessage}"
                );
            } else {
                $frontendUrl = env('FRONTEND_URL', 'http://localhost:8100');
                return redirect()->to(
                    "{$frontendUrl}/login?error={$errorMessage}"
                );
            }
        }
    }

    /**
     * Login tradicional (email/password)
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Verificar si el usuario existe
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no registrado en el sistema',
            ], 401);
        }

        // Verificar si el usuario está activo
        if (!$user->activo) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario inactivo. Contacte al administrador.',
            ], 403);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales inválidas',
            ], 401);
        }

        $user = Auth::user();
        $user->load('role');
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar ?? null,
                    'role' => $user->role ? [
                        'id' => $user->role->id,
                        'nombre' => $user->role->nombre,
                        'slug' => $user->role->slug,
                        'permisos' => $user->role->permisos,
                    ] : null,
                ],
                'token' => $token,
            ],
            'message' => 'Login exitoso',
        ]);
    }

    /**
     * Register (crear nuevo usuario)
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'token' => $token,
            ],
            'message' => 'Usuario creado exitosamente',
        ], 201);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar ?? null,
                'created_at' => $user->created_at,
            ],
        ]);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout exitoso',
        ]);
    }

    /**
     * Refresh token
     */
    public function refresh(Request $request)
    {
        $user = $request->user();
        
        // Revocar token actual
        $request->user()->currentAccessToken()->delete();
        
        // Crear nuevo token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'token' => $token,
            ],
            'message' => 'Token refrescado',
        ]);
    }
}
