<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Camioneta;
use Illuminate\Http\Request;

class CamionetaController extends Controller
{
    public function index()
    {
        $camionetas = Camioneta::orderBy('nombre')->get();
        return response()->json(['success' => true, 'data' => $camionetas]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'placa' => 'nullable|string|max:20',
            'marca' => 'nullable|string|max:100',
            'modelo' => 'nullable|string|max:100',
            'anio' => 'nullable|integer|min:1900|max:2100',
            'color' => 'nullable|string|max:50',
        ]);

        $camioneta = Camioneta::create($request->all());
        return response()->json(['success' => true, 'data' => $camioneta], 201);
    }

    public function show($id)
    {
        $camioneta = Camioneta::findOrFail($id);
        return response()->json(['success' => true, 'data' => $camioneta]);
    }

    public function update(Request $request, $id)
    {
        $camioneta = Camioneta::findOrFail($id);

        $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'placa' => 'nullable|string|max:20',
            'marca' => 'nullable|string|max:100',
            'modelo' => 'nullable|string|max:100',
            'anio' => 'nullable|integer|min:1900|max:2100',
            'color' => 'nullable|string|max:50',
        ]);

        $camioneta->update($request->all());
        return response()->json(['success' => true, 'data' => $camioneta]);
    }

    public function destroy($id)
    {
        $camioneta = Camioneta::findOrFail($id);
        $camioneta->delete();
        return response()->json(['success' => true, 'message' => 'Camioneta eliminada']);
    }

    public function activas()
    {
        $camionetas = Camioneta::where('activo', true)->orderBy('nombre')->get();
        return response()->json(['success' => true, 'data' => $camionetas]);
    }
}
