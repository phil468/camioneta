<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Registro;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\RegistrosExport;
use Maatwebsite\Excel\Facades\Excel;

class RegistroController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Registro::with([
            'cliente',
            'cliente.representanteActivo',
            'chofer', 
            'placa1', 
            'placa2', 
            'descripcionJaba1', 
            'descripcionJaba2',
            'usuario',
            'representanteCliente',
            'aprobadoPor',
            'rechazadoPor',
        ]);

        // Filtros
        if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
            $query->fechaEntre($request->fecha_inicio, $request->fecha_fin);
        }

        if ($request->has('cliente_id')) {
            $query->where('cliente_id', $request->cliente_id);
        }

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        // Búsqueda general
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('numero_registro', 'like', "%{$search}%")
                  ->orWhere('representante_cliente', 'like', "%{$search}%")
                  ->orWhere('guia_remision', 'like', "%{$search}%");
            });
        }

        $registros = $query->orderBy('fecha', 'desc')
                           ->orderBy('hora', 'desc')
                           ->paginate($request->per_page ?? 15);

        return response()->json($registros);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cliente_id' => 'required|exists:clientes,id',
            'representante_cliente_id' => 'nullable|exists:representantes_clientes,id',
            'representante_cliente' => 'nullable|string|max:255',
            'chofer_id' => 'required|exists:choferes,id',
            'placa_1_id' => 'nullable|exists:placas,id',
            'cantidad_jabas_1' => 'required|integer|min:0',
            'cantidad_parihuelas' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->all();
            
            // Generar número de registro automático
            $data['numero_registro'] = Registro::generarNumeroRegistro();
            $data['fecha'] = Carbon::now()->toDateString();
            $data['hora'] = Carbon::now()->toTimeString();
            $data['user_id'] = $request->user_id;
            $data['estado'] = 'por_aprobar';

            // Si viene representante_cliente_id, copiar el nombre al campo legacy
            if (isset($data['representante_cliente_id'])) {
                $representante = \App\Models\RepresentanteCliente::find($data['representante_cliente_id']);
                if ($representante) {
                    $data['representante_cliente'] = $representante->nombre;
                }
            }

            // Guardar imagen
            if ($request->hasFile('imagen')) {
                $path = $request->file('imagen')->store('registros/imagenes', 'public');
                $data['imagen_path'] = $path;
            }

            $registro = Registro::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Registro creado exitosamente',
                'data' => $registro->load(['cliente', 'chofer', 'placa1', 'placa2', 'representanteCliente'])
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el registro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $registro = Registro::with([
            'cliente', 
            'chofer', 
            'placa1', 
            'placa2', 
            'descripcionJaba1', 
            'descripcionJaba2', 
            'usuario', 
            'representanteCliente',
            'aprobadoPor',
            'rechazadoPor'
        ])->find($id);

        if (!$registro) {
            return response()->json(['success' => false, 'message' => 'Registro no encontrado'], 404);
        }

        return response()->json(['success' => true, 'data' => $registro]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $registro = Registro::find($id);

        if (!$registro) {
            return response()->json(['success' => false, 'message' => 'Registro no encontrado'], 404);
        }

        try {
            $data = $request->except(['numero_registro', 'fecha', 'hora', 'user_id']);

            if ($request->hasFile('imagen')) {
                if ($registro->imagen_path) {
                    Storage::disk('public')->delete($registro->imagen_path);
                }
                $data['imagen_path'] = $request->file('imagen')->store('registros/imagenes', 'public');
            }

            $registro->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Registro actualizado',
                'data' => $registro->fresh()->load(['cliente', 'chofer'])
            ]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $registro = Registro::find($id);

        if (!$registro) {
            return response()->json(['success' => false, 'message' => 'Registro no encontrado'], 404);
        }

        if ($registro->imagen_path) {
            Storage::disk('public')->delete($registro->imagen_path);
        }

        $registro->delete();

        return response()->json(['success' => true, 'message' => 'Registro eliminado']);
    }

    /**
     * Cambiar estado del registro
     */
    public function cambiarEstado(Request $request, string $id)
    {
        $registro = Registro::find($id);

        if (!$registro) {
            return response()->json(['success' => false, 'message' => 'Registro no encontrado'], 404);
        }

        $nuevoEstado = $request->estado;
        $userId = auth()->id() ?? $request->user_id;

        $updateData = [
            'estado' => $nuevoEstado,
        ];

        if ($nuevoEstado === 'aprobado') {
            $updateData['aprobado_por'] = $userId;
            $updateData['aprobado_en'] = now();
            $updateData['rechazado_por'] = null;
            $updateData['rechazado_en'] = null;
            $updateData['motivo_rechazo'] = null;
        } elseif ($nuevoEstado === 'rechazado') {
            $updateData['rechazado_por'] = $userId;
            $updateData['rechazado_en'] = now();
            $updateData['aprobado_por'] = null;
            $updateData['aprobado_en'] = null;
            $updateData['motivo_rechazo'] = $request->motivo_rechazo;
        }

        $registro->update($updateData);

        $registro->load([
            'cliente', 'chofer', 'placa1', 'placa2',
            'descripcionJaba1', 'descripcionJaba2',
            'usuario', 'representanteCliente',
            'aprobadoPor', 'rechazadoPor'
        ]);

        return response()->json(['success' => true, 'message' => 'Estado actualizado', 'data' => $registro]);
    }

    /**
     * Adjuntar PDF y datos de guía de remisión
     */
    public function adjuntarPdf(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'serie_guia' => 'required|string|max:10',
            'numero_guia' => 'required|string|max:10',
            'pdf' => 'nullable|file|mimes:pdf|max:10240', // Máximo 10MB, opcional
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $registro = Registro::find($id);
        if (!$registro) {
            return response()->json(['success' => false, 'message' => 'Registro no encontrado'], 404);
        }

        // Validar que el registro esté aprobado
        if ($registro->estado !== 'aprobado') {
            return response()->json([
                'success' => false, 
                'message' => 'Solo se puede adjuntar una guía cuando el registro está aprobado'
            ], 422);
        }

        try {
            $pdfPath = $registro->pdf_path;

            // Guardar PDF si se envió
            if ($request->hasFile('pdf')) {
                $path = $request->file('pdf')->store('registros/pdfs', 'public');
                
                // Eliminar PDF anterior si existe
                if ($registro->pdf_path) {
                    Storage::disk('public')->delete($registro->pdf_path);
                }
                
                $pdfPath = $path;
            }

            // Actualizar registro con serie y número
            $registro->update([
                'pdf_path' => $pdfPath,
                'serie_guia' => $request->serie_guia,
                'numero_guia' => $request->numero_guia
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Guía de remisión adjuntada exitosamente',
                'data' => $registro->fresh([
                    'cliente', 'chofer', 'placa1', 'placa2',
                    'descripcionJaba1', 'descripcionJaba2',
                    'usuario', 'representanteCliente',
                    'aprobadoPor', 'rechazadoPor'
                ])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar la guía',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Extraer número de guía de remisión desde PDF
     * Busca patrones comunes: TXXX-XXXXXXXX, XXX-XXXXXXX, etc.
     */
    private function extraerGuiaRemisionDePdf($pdfFile)
    {
        try {
            // Leer contenido del archivo PDF como texto
            $pdfPath = $pdfFile->getRealPath();
            $content = file_get_contents($pdfPath);
            
            // Convertir a texto (simple extraction - puede no funcionar con todos los PDFs)
            $text = '';
            
            // Intentar extraer texto usando shell_exec y pdftotext si está disponible
            if (function_exists('shell_exec')) {
                $output = shell_exec('pdftotext "' . $pdfPath . '" -');
                if ($output) {
                    $text = $output;
                }
            }
            
            // Si no se pudo extraer con pdftotext, intentar con regex directo en contenido
            if (empty($text)) {
                $text = $content;
            }
            
            // Patrones comunes de guía de remisión
            $patterns = [
                '/GU[IÍ]A[\s:]+([T0-9]{1,4}[\s-]+[0-9]{6,8})/i',
                '/REMISI[OÓ]N[\s:]+([T0-9]{1,4}[\s-]+[0-9]{6,8})/i',
                '/N[UÚ]MERO[\s:]+([T0-9]{1,4}[\s-]+[0-9]{6,8})/i',
                '/([T][0-9]{3}[\s-]+[0-9]{7,8})/i', // Ej: T001-00000123
                '/([0-9]{3}[\s-]+[0-9]{7,8})/i', // Ej: 001-00000123
            ];
            
            foreach ($patterns as $pattern) {
                if (preg_match($pattern, $text, $matches)) {
                    // Limpiar y formatear el número encontrado
                    $guia = trim($matches[1]);
                    $guia = preg_replace('/\s+/', '-', $guia); // Reemplazar espacios con guiones
                    return $guia;
                }
            }
            
            return null;
            
        } catch (\Exception $e) {
            \Log::error('Error extrayendo guía de remisión: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Generar PDF del registro
     */
    public function generarPdf(string $id)
    {
        $registro = Registro::with([
            'cliente',
            'representanteCliente',
            'chofer', 
            'placa1', 
            'placa2', 
            'descripcionJaba1', 
            'descripcionJaba2',
            'usuario'
        ])->find($id);

        if (!$registro) {
            return response()->json(['success' => false, 'message' => 'Registro no encontrado'], 404);
        }

        $data = [
            'registro' => $registro,
            'fecha_generacion' => now()->format('d/m/Y H:i:s')
        ];

        $pdf = Pdf::loadView('pdf.registro', $data);
        $pdf->setPaper('A4', 'portrait');
        
        $nombreArchivo = 'Registro_' . $registro->numero_registro . '_' . date('Ymd_His') . '.pdf';
        
        return $pdf->download($nombreArchivo);
    }

    /**
     * Exportar registros a Excel
     */
    public function exportarExcel(Request $request)
    {
        $filtros = $request->only(['fecha_inicio', 'fecha_fin', 'cliente_id', 'estado']);
        
        $nombreArchivo = 'Registros_' . date('Ymd_His') . '.xlsx';
        
        return Excel::download(new RegistrosExport($filtros), $nombreArchivo);
    }

    /**
     * Descargar PDF de guía de remisión adjunta
     */
    public function descargarGuia(string $id)
    {
        $registro = Registro::find($id);
        
        if (!$registro) {
            return response()->json(['success' => false, 'message' => 'Registro no encontrado'], 404);
        }

        if (!$registro->pdf_path) {
            return response()->json(['success' => false, 'message' => 'No hay guía de remisión adjunta'], 404);
        }

        $filePath = storage_path('app/public/' . $registro->pdf_path);

        if (!file_exists($filePath)) {
            return response()->json(['success' => false, 'message' => 'Archivo no encontrado'], 404);
        }

        $fileName = "Guia_{$registro->serie_guia}-{$registro->numero_guia}.pdf";

        return response()->download($filePath, $fileName, [
            'Content-Type' => 'application/pdf',
        ]);
    }
}
