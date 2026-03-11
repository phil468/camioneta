<?php

namespace App\Services;

use App\Models\Reserva;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    protected $botToken;
    protected $chatId;
    protected $enabled;

    public function __construct()
    {
        $this->botToken = config('services.telegram.bot_token');
        $this->chatId = config('services.telegram.chat_id');
        $this->enabled = !empty($this->botToken) && !empty($this->chatId);
    }

    public function enviarNotificacionReserva(Reserva $reserva): bool
    {
        if (!$this->enabled) {
            Log::info('Telegram no configurado, notificación omitida');
            return false;
        }

        $mensaje = $this->formatearMensajeReserva($reserva);
        return $this->enviarMensaje($mensaje);
    }

    protected function formatearMensajeReserva(Reserva $reserva): string
    {
        $reserva->load(['user', 'camioneta']);

        $mensaje = "🚗 *NUEVA RESERVA DE CAMIONETA*\n\n";
        $mensaje .= "👤 *Usuario:* {$reserva->user->name}\n";
        $mensaje .= "🚙 *Camioneta:* {$reserva->camioneta->nombre}";

        if ($reserva->camioneta->placa) {
            $mensaje .= " ({$reserva->camioneta->placa})";
        }

        $mensaje .= "\n📅 *Fecha:* {$reserva->fecha->format('d/m/Y')}\n";
        $mensaje .= "🕐 *Horario:* {$reserva->hora_inicio} - {$reserva->hora_fin}\n";

        if ($reserva->notas) {
            $mensaje .= "📝 *Notas:* {$reserva->notas}\n";
        }

        return $mensaje;
    }

    protected function enviarMensaje(string $mensaje): bool
    {
        try {
            $url = "https://api.telegram.org/bot{$this->botToken}/sendMessage";

            $response = Http::post($url, [
                'chat_id' => $this->chatId,
                'text' => $mensaje,
                'parse_mode' => 'Markdown',
            ]);

            if ($response->successful()) {
                Log::info('Mensaje de Telegram enviado exitosamente');
                return true;
            }

            Log::error('Error enviando mensaje de Telegram', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return false;
        } catch (\Exception $e) {
            Log::error('Excepción enviando mensaje de Telegram: ' . $e->getMessage());
            return false;
        }
    }
}
