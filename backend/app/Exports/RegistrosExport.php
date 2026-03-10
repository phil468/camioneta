<?php

namespace App\Exports;

use App\Models\Registro;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Color;

class RegistrosExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $filtros;

    public function __construct($filtros = [])
    {
        $this->filtros = $filtros;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        $query = Registro::with([
            'cliente', 
            'chofer', 
            'placa1', 
            'placa2', 
            'descripcionJaba1', 
            'descripcionJaba2',
            'usuario',
            'aprobadoPor',
            'rechazadoPor',
            'representanteCliente'
        ]);

        // Aplicar filtros si existen
        if (isset($this->filtros['fecha_inicio']) && isset($this->filtros['fecha_fin'])) {
            $query->fechaEntre($this->filtros['fecha_inicio'], $this->filtros['fecha_fin']);
        }

        if (isset($this->filtros['cliente_id'])) {
            $query->where('cliente_id', $this->filtros['cliente_id']);
        }

        if (isset($this->filtros['estado'])) {
            $query->where('estado', $this->filtros['estado']);
        }

        return $query->orderBy('fecha', 'desc')->get();
    }

    /**
     * Encabezados de las columnas
     */
    public function headings(): array
    {
        return [
            'Fecha',
            'Hora',
            'N° Registro',
            'Cliente',
            'RUC',
            'Representante',
            'Chofer',
            'DNI Chofer',
            'Placa 1',
            'Placa 2',
            'Descripción Jaba 1',
            'Cantidad Jaba 1',
            'Descripción Jaba 2',
            'Cantidad Jaba 2',
            'Cantidad Parihuelas',
            'Serie Guía',
            'Número Guía',
            'Observaciones',
            'Estado',
            'Motivo Rechazo',
            'Creado Por',
            'Aprobado Por',
            'Fecha Aprobación',
            'Rechazado Por',
            'Fecha Rechazo',
            'Fecha Creación',
        ];
    }

    /**
     * Mapear datos de cada fila
     */
    public function map($registro): array
    {
        return [
            \Carbon\Carbon::parse($registro->fecha)->format('d/m/Y'),
            $registro->hora,
            $registro->numero_registro,
            $registro->cliente->nombre ?? '',
            $registro->cliente->ruc ?? '',
            $registro->representanteCliente->nombre ?? '',
            $registro->chofer->nombre ?? '',
            $registro->chofer->dni ?? '',
            $registro->placa1->numero_placa ?? '',
            $registro->placa2->numero_placa ?? '',
            $registro->descripcionJaba1->descripcion ?? '',
            $registro->cantidad_jabas_1 ?? 0,
            $registro->descripcionJaba2->descripcion ?? '',
            $registro->cantidad_jabas_2 ?? 0,
            $registro->cantidad_parihuelas ?? 0,
            $registro->serie_guia ?? '',
            $registro->numero_guia ?? '',
            $registro->observaciones ?? '',
            strtoupper($registro->estado),
            $registro->motivo_rechazo ?? '',
            $registro->usuario->name ?? '',
            $registro->aprobadoPor->name ?? '',
            $registro->aprobado_en ? \Carbon\Carbon::parse($registro->aprobado_en)->format('d/m/Y H:i:s') : '',
            $registro->rechazadoPor->name ?? '',
            $registro->rechazado_en ? \Carbon\Carbon::parse($registro->rechazado_en)->format('d/m/Y H:i:s') : '',
            $registro->created_at->format('d/m/Y H:i:s'),
        ];
    }

    /**
     * Estilos para el Excel
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Estilo para la primera fila (encabezados)
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '2C3E50'],
                ],
            ],
        ];
    }
}
