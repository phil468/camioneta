<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Placa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PlacaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return $placas = Placa::orderBy('created_at', 'desc')->get();
        try {
            $placas = Placa::orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $placas,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener placas: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get only active plates.
     */
    public function activas()
    {
        try {
            $placas = Placa::where('activo', true)
                ->orderBy('numero_placa', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $placas,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener placas activas: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'numero_placa' => 'required|string|max:10|unique:placas,numero_placa',
            'tipo_vehiculo' => 'nullable|string|max:50',
            'marca' => 'nullable|string|max:50',
            'modelo' => 'nullable|string|max:50',
            'anio' => 'nullable|integer|min:1900|max:2100',
            'activo' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $placa = Placa::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $placa,
                'message' => 'Placa creada exitosamente',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear placa: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $placa = Placa::find($id);

            if (!$placa) {
                return response()->json([
                    'success' => false,
                    'message' => 'Placa no encontrada',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $placa,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener placa: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'numero_placa' => 'required|string|max:10|unique:placas,numero_placa,' . $id,
            'tipo_vehiculo' => 'nullable|string|max:50',
            'marca' => 'nullable|string|max:50',
            'modelo' => 'nullable|string|max:50',
            'anio' => 'nullable|integer|min:1900|max:2100',
            'activo' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $placa = Placa::find($id);

            if (!$placa) {
                return response()->json([
                    'success' => false,
                    'message' => 'Placa no encontrada',
                ], 404);
            }

            $placa->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $placa,
                'message' => 'Placa actualizada exitosamente',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar placa: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $placa = Placa::find($id);

            if (!$placa) {
                return response()->json([
                    'success' => false,
                    'message' => 'Placa no encontrada',
                ], 404);
            }

            // Verificar si tiene registros asociados (placa_1 o placa_2)
            $registrosComoPlaca1 = $placa->registrosComoPlaca1()->count();
            $registrosComoPlaca2 = $placa->registrosComoPlaca2()->count();

            if ($registrosComoPlaca1 > 0 || $registrosComoPlaca2 > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar la placa porque tiene registros asociados',
                ], 409);
            }

            $placa->delete();

            return response()->json([
                'success' => true,
                'message' => 'Placa eliminada exitosamente',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar placa: ' . $e->getMessage(),
            ], 500);
        }
    }
}
