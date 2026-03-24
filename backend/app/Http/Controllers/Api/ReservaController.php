<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use App\Models\Camioneta;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReservaController extends Controller
{
    protected $telegramService;

    public function __construct(TelegramService $telegramService)
    {
        $this->telegramService = $telegramService;
    }

    public function index(Request $request)
    {
        $query = Reserva::with(['user', 'camioneta']);

        // Filtrar por usuario si no es admin
        if ($request->has('solo_propias') && $request->solo_propias) {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->has('camioneta_id')) {
            $query->where('camioneta_id', $request->camioneta_id);
        }

        if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
            $query->whereBetween('fecha', [$request->fecha_inicio, $request->fecha_fin]);
        }

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        $reservas = $query->orderBy('fecha')->orderBy('hora_inicio')->get();
        return response()->json(['success' => true, 'data' => $reservas]);
    }

    /**
     * Obtener slots ocupados para una camioneta en un rango de fechas
     */
    public function slotsOcupados(Request $request)
    {
        $request->validate([
            'camioneta_id' => 'required|exists:camionetas,id',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
        ]);

        $reservas = Reserva::where('camioneta_id', $request->camioneta_id)
            ->whereBetween('fecha', [$request->fecha_inicio, $request->fecha_fin])
            ->whereIn('estado', ['pendiente', 'confirmada'])
            ->select('id', 'user_id', 'fecha', 'hora_inicio', 'hora_fin', 'estado')
            ->with('user:id,name')
            ->get();

        return response()->json(['success' => true, 'data' => $reservas]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'camioneta_id' => 'required|exists:camionetas,id',
            'fecha' => 'required|date',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'notas' => 'nullable|string',
        ]);

        // Verificar que la fecha sea desde hoy en adelante
        $fecha = Carbon::parse($request->fecha);
        if ($fecha->lt(Carbon::today())) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede reservar en fechas pasadas'
            ], 422);
        }

        // Verificar que no exceda 10 días
        if ($fecha->gt(Carbon::today()->addDays(10))) {
            return response()->json([
                'success' => false,
                'message' => 'Solo se puede reservar hasta 10 días adelante'
            ], 422);
        }

        // Verificar que no haya conflicto de horarios
        $conflicto = Reserva::where('camioneta_id', $request->camioneta_id)
            ->where('fecha', $request->fecha)
            ->whereIn('estado', ['pendiente', 'confirmada'])
            ->where(function ($q) use ($request) {
                $q->where(function ($q2) use ($request) {
                    $q2->where('hora_inicio', '<', $request->hora_fin)
                        ->where('hora_fin', '>', $request->hora_inicio);
                });
            })
            ->exists();

        if ($conflicto) {
            return response()->json([
                'success' => false,
                'message' => 'El horario seleccionado ya está reservado'
            ], 422);
        }

        $reserva = Reserva::create([
            'user_id' => $request->user()->id,
            'camioneta_id' => $request->camioneta_id,
            'fecha' => $request->fecha,
            'hora_inicio' => $request->hora_inicio,
            'hora_fin' => $request->hora_fin,
            'estado' => 'confirmada',
            'notas' => $request->notas,
        ]);

        $reserva->load(['user', 'camioneta']);

        // Enviar notificación a Telegram, si no es local
        if (!app()->isLocal()) {
            $this->telegramService->enviarNotificacionReserva($reserva);
        }

        return response()->json(['success' => true, 'data' => $reserva], 201);
    }

    public function show($id)
    {
        $reserva = Reserva::with(['user', 'camioneta'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $reserva]);
    }

    public function update(Request $request, $id)
    {
        $reserva = Reserva::findOrFail($id);

        // Solo el dueño puede editar su reserva
        if ($reserva->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Solo puedes editar tus propias reservas'
            ], 403);
        }

        $request->validate([
            'fecha' => 'sometimes|date',
            'hora_inicio' => 'sometimes|date_format:H:i',
            'hora_fin' => 'sometimes|date_format:H:i',
            'notas' => 'nullable|string',
            'estado' => 'sometimes|in:pendiente,confirmada,cancelada,completada',
        ]);

        // Si cambia horario, verificar conflictos
        $fecha = $request->fecha ?? $reserva->fecha;
        $horaInicio = $request->hora_inicio ?? $reserva->hora_inicio;
        $horaFin = $request->hora_fin ?? $reserva->hora_fin;

        if ($request->has('fecha') || $request->has('hora_inicio') || $request->has('hora_fin')) {
            $conflicto = Reserva::where('camioneta_id', $reserva->camioneta_id)
                ->where('fecha', $fecha)
                ->where('id', '!=', $id)
                ->whereIn('estado', ['pendiente', 'confirmada'])
                ->where(function ($q) use ($horaInicio, $horaFin) {
                    $q->where('hora_inicio', '<', $horaFin)
                        ->where('hora_fin', '>', $horaInicio);
                })
                ->exists();

            if ($conflicto) {
                return response()->json([
                    'success' => false,
                    'message' => 'El horario seleccionado ya está reservado'
                ], 422);
            }
        }

        $reserva->update($request->only(['fecha', 'hora_inicio', 'hora_fin', 'notas', 'estado']));
        $reserva->load(['user', 'camioneta']);

        return response()->json(['success' => true, 'data' => $reserva]);
    }

    public function destroy(Request $request, $id)
    {
        $reserva = Reserva::findOrFail($id);

        // Solo el dueño puede eliminar su reserva
        if ($reserva->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Solo puedes eliminar tus propias reservas'
            ], 403);
        }

        $reserva->delete();
        return response()->json(['success' => true, 'message' => 'Reserva eliminada']);
    }
}
