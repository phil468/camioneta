<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Http;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Configurar HTTP client para desarrollo (deshabilitar verificación SSL)
        if (app()->environment('local')) {
            Http::macro('withoutVerifying', function () {
                return Http::withOptions([
                    'verify' => false,
                ]);
            });
        }
    }
}
