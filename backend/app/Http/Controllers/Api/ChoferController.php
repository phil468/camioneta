<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chofer;
use App\Imports\ChoferesImport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;

class ChoferController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Chofer::with(['cliente', 'placaPrincipal']);

            // Filtrar por cliente si se proporciona
            if ($request->has('cliente_id')) {
                $query->where('cliente_id', $request->cliente_id);
            }

            $choferes = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $choferes,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener choferes: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get only active drivers.
     */
    public function activos(Request $request)
    {
        try {
            $query = Chofer::with(['cliente', 'placaPrincipal'])
                ->where('activo', true);
            
            // Filtrar por cliente si se proporciona
            if ($request->has('cliente_id')) {
                $query->where('cliente_id', $request->cliente_id);
            }

            $choferes = $query->orderBy('nombre', 'asc')->get();

            return response()->json([
                'success' => true,
                'data' => $choferes,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener choferes activos: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cliente_id' => 'nullable|exists:clientes,id',
            'placa_principal_id' => 'nullable|exists:placas,id',
            'nombre' => 'required|string|max:255',
            'dni' => 'required|string|size:8|unique:choferes,dni',
            'licencia' => 'nullable|string|max:20',
            'telefono' => 'nullable|string|max:20',
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
            $chofer = Chofer::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $chofer,
                'message' => 'Chofer creado exitosamente',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear chofer: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $chofer = Chofer::with(['cliente', 'placaPrincipal'])->find($id);

            if (!$chofer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Chofer no encontrado',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $chofer,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener chofer: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255',
            'dni' => 'required|string|size:8|unique:choferes,dni,' . $id,
            'licencia' => 'nullable|string|max:20',
            'telefono' => 'nullable|string|max:20',
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
            $chofer = Chofer::find($id);

            if (!$chofer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Chofer no encontrado',
                ], 404);
            }

            $chofer->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $chofer,
                'message' => 'Chofer actualizado exitosamente',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar chofer: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $chofer = Chofer::find($id);

            if (!$chofer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Chofer no encontrado',
                ], 404);
            }

            // Verificar si tiene registros asociados
            if ($chofer->registros()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el chofer porque tiene registros asociados',
                ], 409);
            }

            $chofer->delete();

            return response()->json([
                'success' => true,
                'message' => 'Chofer eliminado exitosamente',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar chofer: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Import choferes from Excel file.
     */
    public function import(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240', // Max 10MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Archivo inválido',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $import = new ChoferesImport();
            Excel::import($import, $request->file('file'));

            $response = [
                'success' => true,
                'message' => 'Importación completada',
                'imported' => $import->getImported(),
                'updated' => $import->getUpdated(),
            ];

            if (count($import->getErrors()) > 0) {
                $response['errors'] = $import->getErrors();
                $response['message'] = 'Importación completada con errores';
            }

            return response()->json($response);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al importar archivo: ' . $e->getMessage(),
            ], 500);
        }
    }
}
