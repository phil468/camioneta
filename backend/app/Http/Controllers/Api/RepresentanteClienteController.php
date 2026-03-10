<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RepresentanteCliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RepresentanteClienteController extends Controller
{
    /**
     * Lista todos los representantes o filtra por cliente_id
     */
    public function index(Request $request)
    {
        $query = RepresentanteCliente::with('cliente');

        if ($request->has('cliente_id')) {
            $query->where('cliente_id', $request->cliente_id);
        }

        if ($request->has('activo')) {
            $query->where('activo', $request->activo);
        }

        $representantes = $query->orderBy('activo', 'desc')
                               ->orderBy('nombre')
                               ->get();

        return response()->json([
            'success' => true,
            'data' => $representantes
        ]);
    }

    /**
     * Crear un nuevo representante
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cliente_id' => 'required|exists:clientes,id',
            'nombre' => 'required|string|max:255',
            'dni' => 'nullable|string|max:8',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'cargo' => 'nullable|string|max:100',
            'activo' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Si se marca como activo, desactivar otros representantes del mismo cliente
        if ($request->activo) {
            RepresentanteCliente::where('cliente_id', $request->cliente_id)
                               ->update(['activo' => false]);
        }

        $representante = RepresentanteCliente::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Representante creado correctamente',
            'data' => $representante->load('cliente')
        ], 201);
    }

    /**
     * Mostrar un representante específico
     */
    public function show(string $id)
    {
        $representante = RepresentanteCliente::with('cliente')->find($id);

        if (!$representante) {
            return response()->json([
                'success' => false,
                'message' => 'Representante no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $representante
        ]);
    }

    /**
     * Actualizar un representante
     */
    public function update(Request $request, string $id)
    {
        $representante = RepresentanteCliente::find($id);

        if (!$representante) {
            return response()->json([
                'success' => false,
                'message' => 'Representante no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'string|max:255',
            'dni' => 'nullable|string|max:8',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'cargo' => 'nullable|string|max:100',
            'activo' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Si se marca como activo, desactivar otros representantes del mismo cliente
        if ($request->has('activo') && $request->activo) {
            RepresentanteCliente::where('cliente_id', $representante->cliente_id)
                               ->where('id', '!=', $id)
                               ->update(['activo' => false]);
        }

        $representante->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Representante actualizado correctamente',
            'data' => $representante->load('cliente')
        ]);
    }

    /**
     * Eliminar un representante
     */
    public function destroy(string $id)
    {
        $representante = RepresentanteCliente::find($id);

        if (!$representante) {
            return response()->json([
                'success' => false,
                'message' => 'Representante no encontrado'
            ], 404);
        }

        $representante->delete();

        return response()->json([
            'success' => true,
            'message' => 'Representante eliminado correctamente'
        ]);
    }

    /**
     * Activar un representante (desactiva los demás del mismo cliente)
     */
    public function activar(string $id)
    {
        $representante = RepresentanteCliente::find($id);

        if (!$representante) {
            return response()->json([
                'success' => false,
                'message' => 'Representante no encontrado'
            ], 404);
        }

        // Desactivar todos los representantes del cliente
        RepresentanteCliente::where('cliente_id', $representante->cliente_id)
                           ->update(['activo' => false]);

        // Activar el seleccionado
        $representante->update(['activo' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Representante activado correctamente',
            'data' => $representante->load('cliente')
        ]);
    }
}
