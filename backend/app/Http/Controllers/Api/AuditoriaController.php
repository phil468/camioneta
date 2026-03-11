<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use OwenIt\Auditing\Models\Audit;

class AuditoriaController extends Controller
{
    public function index(Request $request)
    {
        $query = Audit::with('user')
            ->orderByDesc('created_at');

        if ($request->has('auditable_type')) {
            $query->where('auditable_type', $request->auditable_type);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('event')) {
            $query->where('event', $request->event);
        }

        if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
            $query->whereBetween('created_at', [$request->fecha_inicio, $request->fecha_fin . ' 23:59:59']);
        }

        $perPage = $request->get('per_page', 20);
        $audits = $query->paginate($perPage);

        return response()->json(['success' => true, 'data' => $audits]);
    }

    public function show($id)
    {
        $audit = Audit::with('user')->findOrFail($id);
        return response()->json(['success' => true, 'data' => $audit]);
    }
}
