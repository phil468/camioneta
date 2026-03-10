<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Registro;
use App\Models\Cliente;
use App\Models\Chofer;
use App\Models\Placa;
use App\Models\DescripcionJaba;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Obtener estadísticas generales del dashboard
     */
    public function getEstadisticas(Request $request)
    {
        try {
            $fechaInicio = $request->input('fecha_inicio', Carbon::now()->subMonths(6)->startOfMonth());
            $fechaFin = $request->input('fecha_fin', Carbon::now()->endOfMonth());

            // Totales generales
            $totales = [
                'total_registros' => Registro::count(),
                'total_clientes' => Cliente::where('activo', true)->count(),
                'total_choferes' => Chofer::where('activo', true)->count(),
                'total_placas' => Placa::where('activo', true)->count(),
            ];

            // Registros por estado
            $registrosPorEstado = Registro::select('estado', DB::raw('count(*) as total'))
                ->groupBy('estado')
                ->get()
                ->mapWithKeys(function ($item) {
                    return [$item->estado => $item->total];
                });

            // Registros por mes (últimos 6 meses)
            $registrosPorMes = Registro::select(
                    DB::raw('DATE_FORMAT(fecha, "%Y-%m") as mes'),
                    DB::raw('count(*) as total')
                )
                ->whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->groupBy('mes')
                ->orderBy('mes', 'asc')
                ->get();

            // Top 5 clientes con más registros
            $topClientes = Registro::select('cliente_id', DB::raw('count(*) as total'))
                ->with('cliente:id,codigo,nombre')
                ->groupBy('cliente_id')
                ->orderByDesc('total')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    return [
                        'cliente_id' => $item->cliente_id,
                        'cliente_codigo' => $item->cliente->codigo ?? 'N/A',
                        'cliente_nombre' => $item->cliente->nombre ?? 'N/A',
                        'total' => $item->total,
                    ];
                });

            // Top 5 choferes con más registros
            $topChoferes = Registro::select('chofer_id', DB::raw('count(*) as total'))
                ->with('chofer:id,nombre,dni')
                ->groupBy('chofer_id')
                ->orderByDesc('total')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    return [
                        'chofer_id' => $item->chofer_id,
                        'chofer_nombre' => $item->chofer->nombre ?? 'N/A',
                        'chofer_dni' => $item->chofer->dni ?? 'N/A',
                        'total' => $item->total,
                    ];
                });

            // Registros por tipo de descripción (jabas vs parihuelas)
            $tipoDescripciones = Registro::select(
                    DB::raw('CASE 
                        WHEN descripciones_jabas.codigo LIKE "J%" THEN "Jabas" 
                        WHEN descripciones_jabas.codigo LIKE "P%" THEN "Parihuelas"
                        ELSE "Otros" 
                    END as tipo'),
                    DB::raw('count(*) as total')
                )
                ->leftJoin('descripciones_jabas', 'registros.descripcion_jaba_1_id', '=', 'descripciones_jabas.id')
                ->groupBy('tipo')
                ->get()
                ->mapWithKeys(function ($item) {
                    return [$item->tipo => $item->total];
                });

            // Registros recientes (últimos 10)
            $registrosRecientes = Registro::with(['cliente:id,codigo,nombre', 'chofer:id,nombre'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($registro) {
                    return [
                        'id' => $registro->id,
                        'numero_registro' => $registro->numero_registro,
                        'fecha' => $registro->fecha,
                        'cliente_nombre' => $registro->cliente->nombre ?? 'N/A',
                        'chofer_nombre' => $registro->chofer->nombre ?? 'N/A',
                        'estado' => $registro->estado,
                        'created_at' => $registro->created_at->format('Y-m-d H:i'),
                    ];
                });

            // Estadísticas de cantidades
            $estadisticasCantidades = [
                'total_jabas' => Registro::sum('cantidad_jabas_1')+Registro::sum('cantidad_jabas_2') ?? 0,
                'total_parihuelas' => Registro::sum('cantidad_parihuelas') ?? 0,
                'promedio_jabas' => round(Registro::avg('cantidad_jabas_1') ?? 0, 2),
                'promedio_parihuelas' => round(Registro::avg('cantidad_parihuelas') ?? 0, 2),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'totales' => $totales,
                    'registros_por_estado' => $registrosPorEstado,
                    'registros_por_mes' => $registrosPorMes,
                    'top_clientes' => $topClientes,
                    'top_choferes' => $topChoferes,
                    'tipo_descripciones' => $tipoDescripciones,
                    'registros_recientes' => $registrosRecientes,
                    'estadisticas_cantidades' => $estadisticasCantidades,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener tendencias mensuales
     */
    public function getTendencias(Request $request)
    {
        try {
            $meses = $request->input('meses', 12);
            $fechaInicio = Carbon::now()->subMonths($meses)->startOfMonth();
            
            $tendencias = Registro::select(
                    DB::raw('DATE_FORMAT(fecha, "%Y-%m") as mes'),
                    DB::raw('count(*) as total_registros'),
                    DB::raw('sum(cantidad_entregada) as total_entregado'),
                    DB::raw('sum(cantidad_recibida) as total_recibido'),
                    DB::raw('count(CASE WHEN estado = "aprobado" THEN 1 END) as aprobados'),
                    DB::raw('count(CASE WHEN estado = "rechazado" THEN 1 END) as rechazados'),
                    DB::raw('count(CASE WHEN estado = "por_aprobar" THEN 1 END) as pendientes')
                )
                ->where('fecha', '>=', $fechaInicio)
                ->groupBy('mes')
                ->orderBy('mes', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $tendencias,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener tendencias: ' . $e->getMessage(),
            ], 500);
        }
    }
}
