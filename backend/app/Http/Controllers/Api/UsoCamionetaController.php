<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UsoCamioneta;
use App\Models\UsoChecklistRespuesta;
use App\Models\ChecklistItem;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
     * Iniciar uso de camioneta con checklist y fotos (atómico)
     */
    public function store(Request $request)
    {
        $request->validate([
            'camioneta_id' => 'required|exists:camionetas,id',
            'reserva_id' => 'nullable|exists:reservas,id',
            'observaciones' => 'nullable|string',
            'checklist' => 'required|array',
            'checklist.*.checklist_item_id' => 'required|exists:checklist_items,id',
            'checklist.*.respuesta' => 'required',
            'checklist.*.comentario' => 'nullable|string',
        ]);

        // Transacción sin fotos: solo datos en BD
        $uso = DB::transaction(function () use ($request) {
            $uso = UsoCamioneta::create([
                'user_id' => $request->user()->id,
                'camioneta_id' => $request->camioneta_id,
                'reserva_id' => $request->reserva_id,
                'hora_inicio' => Carbon::now(),
                'estado' => 'en_uso',
                'observaciones' => $request->observaciones,
            ]);

            foreach ($request->checklist as $index => $item) {
                UsoChecklistRespuesta::create([
                    'uso_camioneta_id' => $uso->id,
                    'checklist_item_id' => $item['checklist_item_id'],
                    'respuesta' => filter_var($item['respuesta'], FILTER_VALIDATE_BOOLEAN),
                    'comentario' => $item['comentario'] ?? null,
                ]);
            }

            return $uso;
        });

        // Fotos después del commit: campos planos foto_0, foto_1, etc.
        $uso->load('checklistRespuestas');
        $respuestas = $uso->checklistRespuestas->values();

        foreach ($request->checklist as $index => $item) {
            $fileKey = "foto_{$index}";
            if ($request->hasFile($fileKey) && isset($respuestas[$index])) {
                $file = $request->file($fileKey);
                if ($file->isValid()) {
                    $extension = $file->guessExtension() ?: 'jpg';
                    $filename = 'checklist_fotos/' . Str::random(40) . '.' . $extension;
                    Storage::disk('public')->put($filename, file_get_contents($file->getPathname()));
                    $respuestas[$index]->update(['foto' => $filename]);
                }
            }
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
