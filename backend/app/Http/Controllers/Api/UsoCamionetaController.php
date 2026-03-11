<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UsoCamioneta;
use App\Models\UsoChecklistRespuesta;
use App\Models\ChecklistItem;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class UsoCamionetaController extends Controller
{
    public function index(Request $request)
    {
        $query = UsoCamioneta::with(['user', 'camioneta', 'reserva', 'checklistRespuestas.checklistItem']);

        if ($request->has('solo_propias') && $request->solo_propias) {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('camioneta_id')) {
            $query->where('camioneta_id', $request->camioneta_id);
        }

        $usos = $query->orderByDesc('hora_inicio')->get();
        return response()->json(['success' => true, 'data' => $usos]);
    }

    /**
     * Iniciar uso de camioneta con checklist
     */
    public function store(Request $request)
    {
        $request->validate([
            'camioneta_id' => 'required|exists:camionetas,id',
            'reserva_id' => 'nullable|exists:reservas,id',
            'observaciones' => 'nullable|string',
            'checklist' => 'required|array',
            'checklist.*.checklist_item_id' => 'required|exists:checklist_items,id',
            'checklist.*.respuesta' => 'required|boolean',
            'checklist.*.comentario' => 'nullable|string',
        ]);

        $uso = UsoCamioneta::create([
            'user_id' => $request->user()->id,
            'camioneta_id' => $request->camioneta_id,
            'reserva_id' => $request->reserva_id,
            'hora_inicio' => Carbon::now(),
            'estado' => 'en_uso',
            'observaciones' => $request->observaciones,
        ]);

        // Guardar checklist respuestas
        foreach ($request->checklist as $item) {
            UsoChecklistRespuesta::create([
                'uso_camioneta_id' => $uso->id,
                'checklist_item_id' => $item['checklist_item_id'],
                'respuesta' => $item['respuesta'],
                'comentario' => $item['comentario'] ?? null,
            ]);
        }

        $uso->load(['user', 'camioneta', 'reserva', 'checklistRespuestas.checklistItem']);
        return response()->json(['success' => true, 'data' => $uso], 201);
    }

    /**
     * Subir foto para un item del checklist
     */
    public function subirFotoChecklist(Request $request, $usoId, $respuestaId)
    {
        $request->validate([
            'foto' => 'required|image|max:5120', // 5MB max
        ]);

        $uso = UsoCamioneta::findOrFail($usoId);

        if ($uso->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Solo puedes modificar tus propios registros'
            ], 403);
        }

        $respuesta = UsoChecklistRespuesta::where('uso_camioneta_id', $usoId)
            ->where('id', $respuestaId)
            ->firstOrFail();

        $path = $request->file('foto')->store('checklist_fotos', 'public');
        $respuesta->update(['foto' => $path]);

        return response()->json(['success' => true, 'data' => $respuesta]);
    }

    public function show($id)
    {
        $uso = UsoCamioneta::with(['user', 'camioneta', 'reserva', 'checklistRespuestas.checklistItem'])
            ->findOrFail($id);
        return response()->json(['success' => true, 'data' => $uso]);
    }

    public function update(Request $request, $id)
    {
        $uso = UsoCamioneta::findOrFail($id);

        if ($uso->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Solo puedes editar tus propios registros'
            ], 403);
        }

        $request->validate([
            'observaciones' => 'nullable|string',
            'checklist' => 'nullable|array',
            'checklist.*.checklist_item_id' => 'required|exists:checklist_items,id',
            'checklist.*.respuesta' => 'required|boolean',
            'checklist.*.comentario' => 'nullable|string',
        ]);

        $uso->update($request->only(['observaciones']));

        // Actualizar checklist si se envía
        if ($request->has('checklist')) {
            foreach ($request->checklist as $item) {
                UsoChecklistRespuesta::updateOrCreate(
                    [
                        'uso_camioneta_id' => $uso->id,
                        'checklist_item_id' => $item['checklist_item_id'],
                    ],
                    [
                        'respuesta' => $item['respuesta'],
                        'comentario' => $item['comentario'] ?? null,
                    ]
                );
            }
        }

        $uso->load(['user', 'camioneta', 'reserva', 'checklistRespuestas.checklistItem']);
        return response()->json(['success' => true, 'data' => $uso]);
    }

    /**
     * Finalizar uso de camioneta
     */
    public function finalizar(Request $request, $id)
    {
        $uso = UsoCamioneta::findOrFail($id);

        if ($uso->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Solo puedes finalizar tus propios registros'
            ], 403);
        }

        if ($uso->estado === 'finalizado') {
            return response()->json([
                'success' => false,
                'message' => 'Este uso ya fue finalizado'
            ], 422);
        }

        $uso->update([
            'hora_fin' => Carbon::now(),
            'estado' => 'finalizado',
        ]);

        $uso->load(['user', 'camioneta', 'reserva', 'checklistRespuestas.checklistItem']);
        return response()->json(['success' => true, 'data' => $uso]);
    }

    public function destroy(Request $request, $id)
    {
        $uso = UsoCamioneta::findOrFail($id);

        if ($uso->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Solo puedes eliminar tus propios registros'
            ], 403);
        }

        $uso->checklistRespuestas()->delete();
        $uso->delete();
        return response()->json(['success' => true, 'message' => 'Uso eliminado']);
    }
}
